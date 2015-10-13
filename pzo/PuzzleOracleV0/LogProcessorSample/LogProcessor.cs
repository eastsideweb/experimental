using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.RegularExpressions;
using System.Diagnostics;
using System.Threading;

namespace LogProcessorSample
{
    class LogEntry
    {
        public bool valid = false; // if not valid parseError will contain the error.
        public String transactionId = "";
        public String timestamp = "";
        public String teamId = "";
        public String teamName = "";
        public String puzzleId = "";
        public String status = "";
        public String extraText = "";

        public String parseError = "";
        public int rowIndex = 0; // row# in log file.

        public LogEntry(int rowIndex)
        {
            this.rowIndex = rowIndex;
        }
    }

    class LogEventArgs : EventArgs
    {
        public String logPath;
        public LogEntry[] entries;

        public LogEventArgs(String path, LogEntry[] entries)
        {
            this.logPath = path;
            this.entries = entries;
        }
    }

    /// <summary>
    /// The log processor watches for new log files as they are moved to the "new" directory.
    /// It opens each file, parses and decrypts the log entries, and calls the event handler supplied at construction
    /// time with these parsed log entries.
    /// </summary>
    class LogProcessor : IDisposable
    {
        // DO NOT MODIFY THESE TWO - they must match the Puzzle Oracle log generation parameters.
        const String LOG_PASSWORD = "moxie";
        const String LOG_ENCRYPT_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";// just alnum

        private string logDirectory;
        FileSystemWatcher watcher;
        EventHandler<LogEventArgs> eh;
        bool active = false;
        BlockingWorkQueue bwq;

        public LogProcessor(string logDirectory, EventHandler<LogEventArgs> eh, BlockingWorkQueue bwq)
        {
            this.bwq = bwq; // we use this for our own internal grunt work (parsing log files)
            this.eh = eh;
            // TODO: Complete member initialization
            this.logDirectory = logDirectory;
            watcher = new FileSystemWatcher();
            watcher.Path = logDirectory;
            /* Watch for change s in LastAccess and LastWrite times, and
               the renaming of files or directories. */
            watcher.NotifyFilter = NotifyFilters.FileName; //| NotifyFilters.DirectoryName;
            // Only watch text files.
            watcher.Filter = "*.csv";

            // Add event handlers.
            watcher.Created += new FileSystemEventHandler(OnChanged);
            //watcher.Deleted += new FileSystemEventHandler(OnChanged);
            //watcher.Renamed += new RenamedEventHandler(OnRenamed);



        }
        // Define the event handlers.
        private void OnChanged(object source, FileSystemEventArgs e)
        {
            if (!active)
            {
                return;
            }

            bwq.enque(this, e, (o1, e1) => {
                const int NUM_RETRIES = 5;
                const int WAIT_TIME_MS = 1000;
                for (int i = 0; i < NUM_RETRIES; i++)
                {
                    try
                    {
                        if (i > 0)
                        {
                            MyConsole.WriteLine("Waiting before retrying...");
                            Thread.Sleep(WAIT_TIME_MS); 
                        }
                        processLogFile(e.FullPath);
                        break;
                    }
                    catch (IOException ex)
                    {
                        Trace.WriteLine("Logged exception " + ex);
                        MyConsole.WriteError(String.Format("Could not process file [{0}]. Retrying...", e.FullPath));
                    }
                }
            });
            Console.WriteLine("File: " + e.FullPath + " " + e.ChangeType);
            // TODO - read all the file content and call the handler.

            


        }

        private void processLogFile(string logFile)
        {
            String[] lines;

            using (TextReader tr = new StreamReader(logFile))
            {
                String allText = tr.ReadToEnd();
                String[] delims = { "\r\n" };
                lines = allText.Split(delims, StringSplitOptions.None);
                tr.Close();
            }
            List<LogEntry> leList = new List<LogEntry>(lines.Length);
            for (int i = 0; i < lines.Length; i++)
            {
                String row = lines[i];
                LogEntry le = parseLogRow(i, row);

                // We skip null entries - these are entries to be ignored.
                if (le != null)
                {
                    leList.Add(le);
                }
            }
            LogEntry[] logEntries = leList.ToArray();

            LogEventArgs lea = new LogEventArgs(logFile, logEntries);

            // call the event handler provided at construction time...
            this.eh(this, lea);
        }

        private LogEntry parseLogRow(int rowIndex, string row)
        {

            // early check for empty row...
            if (row.IndexOf(',') == -1)
            {
                Trace.WriteLine("Ignoing line at row index " + rowIndex + " - no commas");
                return null; // ************ EARLY RETURN *****************
            }

            String[] fields = row.Split(',');
            LogEntry le = new LogEntry(rowIndex);
            if (fields.Length != 7)
            {
                le.valid = false;
                le.parseError = "Incorrect field count.";
                return le; // ************* EARLY RETURN *****************
            }

            le.transactionId = stripEndBlanks(fields[0]);
            le.timestamp = stripEndBlanks(fields[1]);
            le.teamId = stripEndBlanks(fields[2]);
            le.teamName = stripEndBlanks(fields[3]);
            le.puzzleId = stripEndBlanks(fields[4]);
            le.status = stripEndBlanks(fields[5]);
            le.extraText = stripEndBlanks(fields[6]);
            le.parseError = "";
            le.valid = false;

            // Verify team ID form
            const String REGEX_TEAM_ID = "^T[0-9]+$";
            if (!Regex.IsMatch(le.teamId, REGEX_TEAM_ID))
            {
                le.parseError = "Invalid team ID";
                return le; // ************* EARLY RETURN *****************
            }

            // Verify Puzzle ID form
            const String REGEX_META_PUZZLE_ID = "^0+$"; // all zeros
            const String REGEX_PUZZLE_ID = "^[0-9][0-9][0-9]$";

            // Special check for all-zeros...
            if (Regex.IsMatch(le.puzzleId, REGEX_META_PUZZLE_ID))
            {
                Trace.WriteLine("IGNORING META(system) message at row index " + rowIndex);
                return null; // ************* EARLY RETURN *****************
            }

            if (!Regex.IsMatch(le.puzzleId, REGEX_PUZZLE_ID))
            {
                le.parseError = "Invalid puzzle ID";
                return le; // ************* EARLY RETURN *****************
            }

            //le.submission = true; // this is an actual puzzle solution submission....

            // Decrypt and validate status.
            String status = decrypt(le.teamId, le.puzzleId, le.status);
            // Valid status?
            if (!validateStatusField(status))
            {
                le.parseError = "Invalid/unrecognized decrypted status: " + status;
                return le; // ************* EARLY RETURN *****************
            }

            // We don't validate the extra text...
            String extraText = decrypt(le.teamId, le.puzzleId, le.extraText);
            le.status = status;
            le.extraText = extraText;
            le.valid = true;
            return le;
        }

        private bool validateStatusField(string status)
        {
            String[] validValues = {
                                        "CORRECT",
                                        "INCORRECT",
                                        "NOTFOUND",
                                        "BLACKLISTED"
                                    };
            foreach (var s in validValues)
            {
                if (status.Equals(s))
                {
                    return true; // ********* EARLY RETURN ********
                }
            }
            return false;
        }

        public static string stripEndBlanks(string s)
        {
            return Regex.Replace(Regex.Replace(s, @"^\s+", ""), @"\s+$", "");
        }


        internal void startListening()
        {
            // Begin watching.
            watcher.EnableRaisingEvents = true;
            active = true;
        }

        internal void stopListening()
        {
            active = false;
            // Stop watching.
            watcher.EnableRaisingEvents = false;
        }

        void IDisposable.Dispose()
        {
            stopListening();
        }

        // Encrypts/decrypts given text using the oracle password, customized by the puzzle ID.
        private string decrypt(String teamId, String puzzleId, string text)
        {
            string customizer = teamId + puzzleId; // Important - this is the customizer format used for encryption.
            String eText = CryptoHelperCopy.simpleEncryptDecrypt(LOG_PASSWORD, customizer, LOG_ENCRYPT_CHARS, text, false); // false==encrypt
            return eText;
        }
    }
}
