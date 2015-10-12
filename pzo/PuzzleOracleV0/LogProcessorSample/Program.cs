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
        static String basePath = "C:\\Users\\josephj\\Documents\\SCRATCH\\po-logs";
        const String NEW_SUBDIR = "new";
        const String PROCESSED_SUBDIR = "processed";
        const String PROCESSED_WITH_ERRORS_SUBDIR = "processed-with-errors";
        static void Main(string[] args)
        {
            BlockingWorkQueue bwq = new BlockingWorkQueue();
            Console.CancelKeyPress += new ConsoleCancelEventHandler((o, ea) => { Console.WriteLine("CTRL-C: bailing."); ea.Cancel = true;  bwq.stopWaiting(); });
            NewDriveNotifier ndn = new NewDriveNotifier((o, e) => { bwq.enque(o, e, (o1, ea1) => { Console.WriteLine("WORK ITEM -NEW DRIVE-" + ((NewDriveNotifierEventArgs)ea1).driveName); }); });
            ndn.startListening();
            bwq.enque(null, null, (o, ea) => { Console.WriteLine("WORK ITEM -A-"); });
            bwq.enque(null, null, (o, ea) => { Console.WriteLine("WORK ITEM -B-"); });
            bwq.enque(null, null, (o, ea) => { Console.WriteLine("WORK ITEM -C-"); });
            bwq.process();
            Console.WriteLine("Enter to quit...");
            String s = Console.ReadLine();
            /*String newLogDirectory = basePath + "\\" + NEW_SUBDIR;
            using (LogProcessor lp = new LogProcessor(newLogDirectory)) {
            lp.registerEventHandler((s,e) => myLogEventHandler(s,e));
            lp.start();
            Console.WriteLine("Enter something to quit.");
            String input = Console.ReadLine();
            lp.stop();
            }*/
        }

        //delegate<>
        static void myLogEventHandler(object sender, LogEventArgs e) {
            Console.WriteLine("Processing entries from log file " + e.logPath);
            Console.WriteLine("");
            Boolean hadErrors = false;
            foreach (var le in e.entries)
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
                if (!le.valid) {
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
            Console.WriteLine("End of entries from log file " + e.logPath);

            //
            // TODO: Actually process / commit the data.
            // If ALL entries have been successfully committed to the database, one can
            // move the file to the processed subdirectory, like so...
            //

            String processedDir = basePath + "\\" + (hadErrors ? PROCESSED_WITH_ERRORS_SUBDIR : PROCESSED_SUBDIR);
            if (!Directory.Exists(processedDir))
            {
                Console.WriteLine("ERROR: Processed dir does not exist: " + processedDir);
            }
            else
            {

                String destPath = processedDir + "\\" + Path.GetFileName(e.logPath);
                try
                {
                    File.Move(e.logPath, destPath);
                    Console.WriteLine("Movded file to " + destPath);
                }
                catch (Exception ex)
                {
                    if (ex is IOException || ex is ArgumentException )
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
