using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Diagnostics;

namespace LogProcessorSample
{
    class Program
    {
        public const String LOG_PROCESSOR_SUBDIR = "\\PuzzleLogProcessor";
        const String VERSION = "1.0";
        const String MODULE = "MAIN: "; // for debug log.
        const String THUMBDRIVE_VOLUME_REGEX = "^PZO-"; // Volume labels of thrumb drives must match this regex to be considered.
        static void Main(string[] args)
        {
            string baseWorkingDir = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) + LOG_PROCESSOR_SUBDIR;

            MyConsole.Initialize();
            MyConsole.WriteImportant("LOG PROCESSOR Version " + VERSION);
            MyConsole.WriteImportant(String.Format("Working directory [{0}]", baseWorkingDir));
            MyConsole.WriteImportant("Press CTRL-C to quit");

            try
            {


                if (!initializeLogging(baseWorkingDir))
                {
                    // Can't progress...
                    throw new ApplicationException("Cannot initialize logging.");
                }

                // Initialie the blocking work queue - it runs all significant processing operations in sequence on the main thread.
                BlockingWorkQueue workQueue = new BlockingWorkQueue();
                //workQueue.enque(null, null, (o, ea) => { Console.WriteLine("TEST WORK ITEM -A-"); });
                //workQueue.enque(null, null, (o, ea) => { Console.WriteLine("TEST WORK ITEM -B-"); });

                // Register the CTRL-C handler - this lets the user quit the program and potentially enter other commands.
                // TODO: Currently the handler simply causes the work queue to exit after the latter processes current work items. Perhaps add some
                // command processing and request confirmation of this behavior.
                Console.CancelKeyPress += new ConsoleCancelEventHandler((o, ea) => { myCtrlCHandler(ea, workQueue); });

                // Create the file copier - responsible for copying files from thumb drives to a staging directory, verifying the file copy and then moving
                // the source files into an arcive subdir on the thumb drive, and (finally) moving the newly copied files under the "new" directory.
                FileCopier fileCopier = new FileCopier(baseWorkingDir, THUMBDRIVE_VOLUME_REGEX);

                // Create a new-drive notifier and hook it up to the file copier - so that the latter will get notified whenever there is a new removable drive
                // plugged in.
                //NewDriveNotifier ndn = new NewDriveNotifier((o, e) => { bwq.enque(o, e, (o1, ea1) => { Console.WriteLine("WORK ITEM -NEW DRIVE-" + ((NewDriveNotifierEventArgs)ea1).driveName); }); });
                using (NewDriveNotifier driveNotifier = new NewDriveNotifier((o, e) => { workQueue.enque(o, e, fileCopier.newDriveHandler); }))
                {

                    // Create a log consumer - this processes submission requests pulled from individual puzzle oracle log files.
                    LogConsumer logConsumer = new LogConsumer(baseWorkingDir);

                    // Create the log processor - that processes new log files as they show up in the "new" directory. Hook it up to the log consumer so that the latter
                    // processes the submissions requests.
                    String newLogsDir = fileCopier.newDir;
                    using (LogProcessor lp = new LogProcessor(newLogsDir, (o, e) => { workQueue.enque(o, e, logConsumer.logEventHandler); }, workQueue))
                    {
                        lp.startListening(); // start listening for new files in the "new directory"
                        driveNotifier.startListening(); // start listening for new thumb drives
                        workQueue.process();
                    }
                }
            }
            catch (ApplicationException e)
            {
                Trace.TraceError("Caught application exception: " + e);
                MyConsole.WriteError("THE LOG PROCESSOR MUST EXIT.\nPress ENTER to quit.");
                Trace.Flush();
                Console.ReadLine();
            }
        }

        private static void myCtrlCHandler(ConsoleCancelEventArgs ea, BlockingWorkQueue workQueue)
        {
            Trace.WriteLine(MODULE + "In CTRL-C handler."); 
            ea.Cancel = true;
            workQueue.enque(null, null, (ox, ex) => {
                MyConsole.WriteImportant("CTRL-C received. Ok to quit (y/n)?");
                String s = ""  + (char) Console.Read();
                if (s.ToUpperInvariant().IndexOf('Y') == 0)
                {
                    workQueue.stopWaiting();
                }
            }); 
        }

        private static bool initializeLogging(string baseWorkingDir)
        {
            // Check that the base directory exists...
            if (!Directory.Exists(baseWorkingDir))
            {
                MyConsole.WriteError(String.Format("Working directory [{0}]\ndoes not exist.\nPlease create it and restart the log processor.",baseWorkingDir));
                return false; // ************ EARLY RETURN **************
            }

            // Create a trace listener
            string debugLogPath = baseWorkingDir + "\\debuglog.txt";
            Trace.Listeners.Add(new TextWriterTraceListener(debugLogPath));
            Trace.WriteLine("Log Started");
            Trace.Flush();

            // Verify that the debug log file exists.
            if (!File.Exists(debugLogPath))
            {
                Trace.TraceWarning(String.Format("Debug log [{0}] is not created.", debugLogPath));
                return false; // ************ EARLY RETURN **************
            }
            return true;
        }
    }
}
