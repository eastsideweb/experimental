using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

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
    class LogProcessor : IDisposable
    {
        private string logDirectory;
        FileSystemWatcher watcher;
        List<EventHandler<LogEventArgs>> ehList;
        bool active = false;

        public LogProcessor(string logDirectory)
        {
            ehList = new List<EventHandler<LogEventArgs>>();
            // TODO: Complete member initialization
            this.logDirectory = logDirectory;
            watcher = new FileSystemWatcher();
            watcher.Path = logDirectory;
            /* Watch for changes in LastAccess and LastWrite times, and
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
            Console.WriteLine("File: " + e.FullPath + " " + e.ChangeType);
            // TODO - read all the file content and call the handler.

            processLogFile(e.FullPath);


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
            LogEntry[] logEntries = new LogEntry[lines.Length]; // could be of length 0.
            for (int i = 0; i < lines.Length; i++)
            {
                String row = lines[i];
                LogEntry le = parseLogRow(i, row);
                logEntries[i] = le;
            }

            LogEventArgs lea = new LogEventArgs(logFile, logEntries);
            foreach (var eh in ehList)
            {
                eh(this, lea);
            }

        }

        private LogEntry parseLogRow(int rowIndex, string row)
        {
            String[] fields = row.Split(',');
            LogEntry le = new LogEntry(rowIndex);
            if (fields.Length != 7)
            {
                le.valid = false;
                le.parseError = "Incorrect field count.";
                return le; // ************* EARLY RETURN *****************
            }

            le.transactionId = fields[0];
            le.timestamp = fields[1];
            le.teamId = fields[2];
            le.teamName = fields[3];
            le.puzzleId = fields[4];
            le.status = fields[5];
            le.extraText = fields[6];
            le.parseError = "";
            le.valid = false; // TODO - haven't done any verification yet...
            return le;
        }

        internal void registerEventHandler(EventHandler<LogEventArgs> eh)
        {
            ehList.Add(eh);
        }

        internal void start()
        {
            // Begin watching.
            watcher.EnableRaisingEvents = true;
            active = true;
        }

        internal void stop()
        {
            active = false;
            // Stop watching.
            watcher.EnableRaisingEvents = false;
            //throw new NotImplementedException();
        }

        void IDisposable.Dispose()
        {
            watcher.EnableRaisingEvents = false;
        }
    }
}
