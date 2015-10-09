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
            Console.WriteLine(e);
        }
    }


}
