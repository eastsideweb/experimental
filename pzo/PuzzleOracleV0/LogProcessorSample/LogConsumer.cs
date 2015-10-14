using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Diagnostics;

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
        const String MODULE = "LC: "; // For debug log.
        const String NEW_SUBDIR = "new";
        const String PROCESSED_SUBDIR = "processed";
        const String PROCESSED_WITH_ERRORS_SUBDIR = "processed-with-errors";
        const String RESULTS_SUBDIR = "results";

        readonly String baseWorkingDir;
        readonly String resultsDir;
        readonly String processedDir;
        readonly String processedWithErrorsDir;

        public LogConsumer(String baseWorkingDir)
        {
            this.baseWorkingDir = baseWorkingDir;
            this.resultsDir = baseWorkingDir + "\\" + RESULTS_SUBDIR;
            this.processedDir = baseWorkingDir + "\\" + PROCESSED_SUBDIR;
            this.processedWithErrorsDir = baseWorkingDir + "\\" + PROCESSED_WITH_ERRORS_SUBDIR;

            // Create needed sub-dirs if needed ('true' means exit the program on error).
            Utils.createDirIfNeeded(resultsDir, true);
            Utils.createDirIfNeeded(processedDir, true);
            Utils.createDirIfNeeded(processedWithErrorsDir, true);
        }

        public void logEventHandler(object sender, EventArgs ea)
        {
            LogEventArgs lea = (LogEventArgs)ea;
            MyConsole.WriteImportant(String.Format("Processing [{0}] ({1} submission(s))", Path.GetFileName(lea.logPath), lea.entries.Length));
            Boolean hadErrors = false;

            // Let's first check if the file has already been processed successfully...
            String tempPath = this.processedDir + "\\" + Path.GetFileName(lea.logPath);
            if (File.Exists(tempPath))
            {
                if (Utils.filesHaveSameContent(lea.logPath, tempPath))
                {
                    MyConsole.WriteWarning("\tSkipping file because an identifical file has already been processed.");
                    File.Delete(lea.logPath);
                    return; // ***************************** EARLY RETURN *****************
                }
                else
                {
                    // This is a sticky situation. The file exists, but it's different.
                    // We'll process the content, flag this as an error and copy the file over to the processed-with-errors dir.
                    MyConsole.WriteError(String.Format("\tThis file exists under the processed dir with DIFFERENT content!"
                        + "\n\tProcessing file and moving to the [{0}] folder.", PROCESSED_WITH_ERRORS_SUBDIR));
                    hadErrors = true;
                }
            }

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
                else
                {
                    this.processEntry(le);
                }
                MyConsole.WriteLine("\t" + le.rowIndex + ":" + s + suffix);
            }

            //
            // TODO: Actually process / commit the data.
            // If ALL entries have been successfully committed to the database, one can
            // move the file to the processed subdirectory, like so...
            //


            String destDir = (hadErrors ? processedWithErrorsDir : this.processedDir);
            {

                String destPath = destDir + "\\" + Path.GetFileName(lea.logPath);

                try
                {
                    if (File.Exists(destPath))
                    {
                        Trace.WriteLine(MODULE + String.Format("WARNING: File with same name as\n[{0}]exists in the processed dir.", lea.logPath));
                        if (Utils.filesHaveSameContent(lea.logPath, destPath))
                        {
                            Trace.WriteLine(MODULE + String.Format("Files have same content."));
                            File.Delete(destPath);
                        }
                        else
                        {
                            // This is a dodgy situation where we're attempting to move over a file a file already exists on the destination
                            // and its' content is different. We attempt to save the file with a variation of the name --- up to MAX_TRIES times.
                            const int MAX_TRIES = 10;
                            String origPath = destPath;
                            int i = 1;
                            do
                            {
                                if (i > MAX_TRIES)
                                {
                                    MyConsole.WriteError(String.Format("\tTo many versions of file exists in destination directory!"));
                                    throw new ArgumentException("Too many file versions.");
                                }
                                destPath = Utils.generateFileNameVariation(origPath, i);
                                if (File.Exists(destPath) && Utils.filesHaveSameContent(lea.logPath, destPath))
                                {
                                    File.Delete(destPath);
                                }
                                i++;
                            } while (File.Exists(destPath));
                            MyConsole.WriteError(String.Format("\tFile exists at destination and is different.\n\tMoving as different name [{0}] ", Path.GetFileName(destPath)));
                        }
                    }

                    // At this point we're pretty sure that the dest path does not exist!
                    File.Move(lea.logPath, destPath);
                    Trace.WriteLine(MODULE + "Moved file to " + destPath);

                }
                catch (Exception ex)
                {
                    if (ex is IOException || ex is ArgumentException)
                    {
                        MyConsole.WriteError("\tERROR: Exception while moving path. ex=" + ex.Message);
                    }
                    else
                    {
                        throw ex;
                    }
                }
            }
        }



        /// <summary>
        /// Process a single valid submission log entry.
        /// </summary>
        /// <param name="le"></param>
        private void processEntry(LogEntry le)
        {
            Debug.Assert(le.valid);
            if (le.status.Equals("CORRECT"))
            {
                recordSolve(le);
            }
        }

        private void recordSolve(LogEntry le)
        {
            // Record the fact that a particular team has solved a particular puzzle.
            // The way we do this currently is writing out a file <teamID>-<puzzleID>.txt (if it doesn't already exist)
            String content = String.Format("{0},{1}", le.transactionId, le.timestamp);
            String solveFile = resultsDir + "\\" + String.Format("{0}-{1}.txt", le.teamId, le.puzzleId);
            try
            {
                if (!File.Exists(solveFile))
                {
                    Utils.writeTextFile(solveFile, content);
                }
            }
            catch (IOException ex)
            {
                MyConsole.WriteError(String.Format("WARNING Could not write file [{0}]", solveFile));
            }
        }
    }
}
