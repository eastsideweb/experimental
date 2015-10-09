using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogProcessorSample
{
    class Program
    {
        static void Main(string[] args)
        {
            String logDirectory = "C:\\Users\\josephj\\Documents\\SCRATCH\\new";
            using (LogProcessor lp = new LogProcessor(logDirectory)) {
            lp.registerEventHandler((s,e) => myLogEventHandler(s,e));
            lp.start();
            Console.WriteLine("Enter something to quit.");
            String input = Console.ReadLine();
            lp.stop();
            }
        }

        //delegate<>
        static void myLogEventHandler(object sender, LogEventArgs e) {
            Console.WriteLine("Processing entries from log file " + e.logPath);
            Console.WriteLine("");
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
                    suffix = String.Format("(INVALID - {0})", le.parseError);
                }
                Console.WriteLine(le.rowIndex + ":" + s + suffix);
            }
            Console.WriteLine("End of entries from log file " + e.logPath);
        }
    }


}
