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
        static void Main(string[] args)
        {
            string baseWorkingDir = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments)
                + "\\PuzzleOracle\\consolated";

            // Initialie the blocking work queue - it runs all significant processing operations in sequence on the main thread.
            BlockingWorkQueue workQueue = new BlockingWorkQueue();
            //workQueue.enque(null, null, (o, ea) => { Console.WriteLine("TEST WORK ITEM -A-"); });
            //workQueue.enque(null, null, (o, ea) => { Console.WriteLine("TEST WORK ITEM -B-"); });

            // Register the CTRL-C handler - this lets the user quit the program and potentially enter other commands.
            // TODO: Currently the handler simply causes the work queue to exit after the latter processes current work items. Perhaps add some
            // command processing and request confirmation of this behavior.
            Console.CancelKeyPress += new ConsoleCancelEventHandler((o, ea) => { Console.WriteLine("CTRL-C: bailing."); ea.Cancel = true; workQueue.stopWaiting(); });

            // Create the file copier - responsible for copying files from thumb drives to a staging directory, verifying the file copy and then moving
            // the source files into an arcive subdir on the thumb drive, and (finally) moving the newly copied files under the "new" directory.
            FileCopier fileCopier = new FileCopier(baseWorkingDir);

            // Create a new-drive notifier and hook it up to the file copier - so that the latter will get notified whenever there is a new removable drive
            // plugged in.
            //NewDriveNotifier ndn = new NewDriveNotifier((o, e) => { bwq.enque(o, e, (o1, ea1) => { Console.WriteLine("WORK ITEM -NEW DRIVE-" + ((NewDriveNotifierEventArgs)ea1).driveName); }); });
            using (NewDriveNotifier driveNotifier = new NewDriveNotifier((o, e) => { workQueue.enque(o, e, fileCopier.newDriveHandler); }))
            {

                // Create a log consumer - this processes submission requests pulled from individual puzzle oracle log files.
                LogConsumer logConsumer = new LogConsumer(baseWorkingDir);

                // Create the log processor - that processes new log files as they show up in the "new" directory. Hook it up to the log consumer so that the latter
                // processes the submissions requests.
                using (LogProcessor lp = new LogProcessor(baseWorkingDir, (o, e) => { workQueue.enque(o, e, logConsumer.logEventHandler); }))
                {
                    lp.startListening(); // start listening for new files in the "new directory"
                    driveNotifier.startListening(); // start listening for new thumb drives
                    workQueue.process();
                }
            }
        }
    }
}
