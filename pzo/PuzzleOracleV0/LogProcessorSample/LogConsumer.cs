using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace LogProcessorSample
{
    /// <summary>
    /// The log consumer accepts (consumes) parsed, decrypted submission attempts from teams.
    /// Once it has processed these data it moves the source log file from the "new" directory
    /// into a "processed" subdirectory (or a "processed with errors") sub directory if there were
    /// issues with processing the entries from this file.
    /// </summary>
    class LogConsumer
    {
        const String NEW_SUBDIR = "new";
        const String PROCESSED_SUBDIR = "processed";
        const String PROCESSED_WITH_ERRORS_SUBDIR = "processed-with-errors";

        String baseWorkingDir;
        String resultsDir;

        public LogConsumer(String baseWorkingDir)
        {
            this.baseWorkingDir = baseWorkingDir;
            this.resultsDir = baseWorkingDir + "\\" + "results";
        }

        public void logEventHandler(object sender, EventArgs ea)
        {
            LogEventArgs lea = (LogEventArgs)ea;
            Console.WriteLine("Processing entries from log file " + lea.logPath);
            Console.WriteLine("");
            Boolean hadErrors = false;
            foreach (var le in lea.entries)
            {
                String s = String.Format("{0},{1},{2},{3},{4},{5},{6}",
                    le.transactionId,
                    le.timestamp,
                    le.teamId,
                    le.teamName,
                    le.puzzleId,
                    le.status,
                    le.extraText
                    );
                String suffix = "(OK)";
                if (!le.valid)
                {
                    // TODO: Watch for invalid entries! Report these to the user.
                    // Also, if there are any invalid entries, OR some other error 
                    // attempting to submit the entry to the database,
                    // make a note here and do NOT move the file to the "processed" folder (see below)
                    // Instead move the file to the "processed-with-errors" folder.
                    suffix = String.Format("(INVALID - {0})", le.parseError);
                    hadErrors = true;
                }
                Console.WriteLine(le.rowIndex + ":" + s + suffix);
            }
            Console.WriteLine("End of entries from log file " + lea.logPath);

            //
            // TODO: Actually process / commit the data.
            // If ALL entries have been successfully committed to the database, one can
            // move the file to the processed subdirectory, like so...
            //

            String processedDir = baseWorkingDir + "\\" + (hadErrors ? PROCESSED_WITH_ERRORS_SUBDIR : PROCESSED_SUBDIR);
            if (!Directory.Exists(processedDir))
            {
                Console.WriteLine("ERROR: Processed dir does not exist: " + processedDir);
            }
            else
            {

                String destPath = processedDir + "\\" + Path.GetFileName(lea.logPath);
                try
                {
                    File.Move(lea.logPath, destPath);
                    Console.WriteLine("Movded file to " + destPath);
                }
                catch (Exception ex)
                {
                    if (ex is IOException || ex is ArgumentException)
                    {
                        Console.WriteLine("ERROR: Exception while moving path. ex=" + ex.Message);
                    }
                    else
                    {
                        throw ex;
                    }
                }
            }
        }
    }
}
