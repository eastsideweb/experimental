using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace LogProcessorSample
{
    /// <summary>
    /// The file copier processes new thumb drives as they show up - it checks that these drives contain valid logs 
    /// and then copies these over to the staging directory, verifies the integrity of the copy, and then moves the 
    /// logs in the thumb drive under a "archived" sub-dir in the thumb drive. Finally it moves the files in the
    /// staging directory to the "new" directory (where it will be processed by the log processor).
    /// </summary>
    class FileCopier
    {
        const string SOURCE_DIR = "PuzzleOracle\\logs"; // Logs directory on thumb drive
        const string LOG_FILE_PATTERN = "T*.csv"; // We look for files that match this pattern in the thumb dir's logs directory.
        const string MODULE = "FC: ";
        const string ARCHIVED = "archived";
        const string NEW = "new";
        const string STAGING = "staging";

        public readonly String stagingDir;
        public readonly String newDir;
        readonly String volumeFilterRegex;

        public FileCopier(String baseWorkingDir, String volumeFilterRegex)
        {
            stagingDir = baseWorkingDir + "\\" + STAGING;
            newDir = baseWorkingDir + "\\" + NEW;
            this.volumeFilterRegex = volumeFilterRegex;

            // If new and staging directories do not exist, create them. (true == critical, i.e., exit program if unsuccessful)
            Utils.createDirIfNeeded(stagingDir, true);
            Utils.createDirIfNeeded(newDir, true);

        }

        /// <summary>
        /// Handles a new thumb drive in the system. It does the following:
        /// 1. Verify that this is a drive we should look at - based on the volume label matching a pattern and the existance of
        ///    the logs directory.
        /// 2. Copy and verify each log file into the staging directory. Once verified move the log file under the source "archived" subdir.
        /// 3. Once all files are copied to staging. Move the files from staging to the "new" dir. Only files that were copied *to* staging
        ///    are moved.
        /// 4. Report any discrepancies - including files that remain un-archived or that remain in staging.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        public void newDriveHandler(object sender, EventArgs e)
        {
            NewDriveNotifierEventArgs nde = (NewDriveNotifierEventArgs)e;
            String driveName = nde.driveName;
            DriveInfo[] drives = DriveInfo.GetDrives();
            DriveInfo diFound = null;
            diFound = drives.FirstOrDefault((di) => { return di.Name.Equals(driveName); });
            if (diFound == null)
            {
                Trace.TraceWarning(String.Format(MODULE + "Asked to handle drive [{0}]that can no longer be found. Ignoring", driveName));
                return; // ************** EARLY RETURN ************
            }
            if (!Regex.IsMatch(diFound.VolumeLabel, volumeFilterRegex))
            {
                Trace.TraceInformation(String.Format("Ignoring drive [{0}] because it's volume [{1}] does not match regex [{2}]", driveName, diFound.VolumeLabel, volumeFilterRegex));
                MyConsole.WriteWarning(String.Format("Ignoring drive [{0}] because it's volume [{1}] is unrecognized", driveName, diFound.VolumeLabel));
                return; // ************* EARLY RETURN ****************
            }
            MyConsole.WriteImportant(String.Format("Processing new drive [{0}] (Volume [{1}])", driveName, diFound.VolumeLabel));
            String sourceLogPath = diFound.RootDirectory + SOURCE_DIR;

            try
            {
                if (!Directory.Exists(sourceLogPath))
                {
                    MyConsole.WriteWarning("\tThe drive does not have a log directory. Ignoring. OK to eject.");
                    return; // ************* EARLY RETURN ****************
                }

                var sourceFiles = Directory.EnumerateFiles(sourceLogPath, LOG_FILE_PATTERN).ToArray();

                if (sourceFiles.Length == 0)
                {
                    // No files to copy!
                    MyConsole.WriteLine("\tNo logs to copy. OK to Eject.");
                    return; // **************** EARLY RETURN ***************
                }

                // Create an "archives" subdir under the source path if it doesn't already exist.
                String archiveDir = sourceLogPath + "\\" + ARCHIVED;
                if (!Directory.Exists(archiveDir))
                {
                    MyConsole.WriteLine(String.Format("\tCreating [{0}] sub-directory at source.", ARCHIVED));
                    Directory.CreateDirectory(archiveDir);
                }
                foreach (String file in sourceFiles)
                {
                    handleOneFile(file, archiveDir);
                }

                var sourceFiles2 = Directory.EnumerateFiles(sourceLogPath, LOG_FILE_PATTERN).ToArray();

                // Let's check if there any files in the source directory...
                if (sourceFiles2.Length > 0)
                {
                    MyConsole.WriteWarning("\tThe following files were NOT archived:");
                    foreach (String file in sourceFiles2)
                    {
                        String fn = Path.GetFileName(file);
                        MyConsole.WriteWarning("\t\t" + fn);
                    }
                }


                // Let's check if there any files in the staging directory...
                var stagingFiles = Directory.EnumerateFiles(sourceLogPath, LOG_FILE_PATTERN).ToArray();
                if (stagingFiles.Length > 0)
                {
                    MyConsole.WriteWarning("\tThe following files are STILL in staging:");
                    foreach (String file in stagingFiles)
                    {
                        String fn = Path.GetFileName(file);
                        MyConsole.WriteWarning("\t\t" + fn);
                    }
                }

            }
            catch (IOException ex)
            {
                Trace.TraceError(MODULE + "IO Exception attempting to process log files from thumb drive. " + ex);
                MyConsole.WriteError("\tSystem error while attempting to process logs from drive "+ driveName);
            }
            MyConsole.WriteImportant(String.Format("Done copying logs from drive [{0}] (Volume [{1}]).", driveName, diFound.VolumeLabel));
            MyConsole.WriteImportant("Please eject and remove drive, then press ENTER to process the logs.");
            Console.Beep();
            Console.ReadLine();

        }

        /// <summary>
        /// Copy 1 file from source thumb drive, verify the copy,  move the copied source file
        /// to the archived subdir of the thumb drive, and finally move copied file from staging to new.
        /// </summary>
        /// <param name="sourcePath"></param>
        /// <param name="archiveDir"></param>
        private void handleOneFile(string sourcePath, string archiveDir)
        {
            String fileName = Path.GetFileName(sourcePath);
            String destPath = this.stagingDir + "\\" + fileName;
            MyConsole.WriteLine(String.Format("\tCopying log [{0}]", fileName));

            if (safeCopy(sourcePath, destPath, "\t\t"))
            {
                // Archive source.
                String archivePath = archiveDir + "\\" + fileName;
                if (safeMove(sourcePath, archivePath, "\t\t"))
                {
                    MyConsole.WriteLine("\t\tFile archived.");
                }

                // Finally - move to new.
                String newFile = newDir + "\\" + fileName;
                if (safeMove(destPath, newFile, "\t\t"))
                {
                    MyConsole.WriteLine("\t\tFile moved from staging to new.");
                }
            }
            else
            {
                MyConsole.WriteError("\t\tNOT archiving file and NOT attempting to move from staging to new.");
            }
        }

        bool safeCopy(String sourcePath, String destPath, String msgPrefix)
        {
            Boolean result = false;

            try
            {
                // Check if the file exists already!
                if (File.Exists(destPath))
                {
                    if (Utils.filesHaveSameContent(sourcePath, destPath))
                    {
                        result = true;
                    }
                    else
                    {
                        MyConsole.WriteError(msgPrefix + "File exists in staging but has DIFFERENT content!");
                        MyConsole.WriteError(msgPrefix + "Not copying this file.");
                    }
                }
                else
                {
                    File.Copy(sourcePath, destPath);
                    if (Utils.filesHaveSameContent(sourcePath, destPath))
                    {
                        MyConsole.WriteLine(msgPrefix + "Copy verified.");
                        result = true;

                    }
                    else
                    {
                        MyConsole.WriteWarning(msgPrefix + "Copied file does NOT match source!");
                        Trace.TraceError(MODULE + String.Format("Copied file [{0}] does not match source [{1}].", sourcePath, destPath));
                    }
                }
            }
            catch (IOException ex)
            {
                Trace.TraceError(MODULE + String.Format("IO Exception attempting to copy file from [{0}] to [{1}]", sourcePath, destPath) + ex);
                MyConsole.WriteError(msgPrefix + "System error while attempting to copy file.");
            }
            return result;
        }

        bool safeMove(String sourcePath, String destPath, String msgPrefix)
        {
            Boolean result = false;

            try
            {
                // Check if the file exists already!
                if (File.Exists(destPath))
                {
                    if (Utils.filesHaveSameContent(sourcePath, destPath))
                    {
                        result = true;
                    }
                    else
                    {
                        MyConsole.WriteError(msgPrefix + "File exists in staging but has DIFFERENT content!");
                        MyConsole.WriteError(msgPrefix + "Not moving this file.");
                    }
                }
                else
                {
                    File.Move(sourcePath, destPath);
                    result = true;
                }
            }
            catch (IOException ex)
            {
                Trace.TraceError(MODULE + String.Format("IO Exception attempting to move file from [{0}] to [{1}]", sourcePath, destPath) + ex);
                MyConsole.WriteError(msgPrefix + "System error while attempting to move file.");
            }
            return result;
        }
    }
}
