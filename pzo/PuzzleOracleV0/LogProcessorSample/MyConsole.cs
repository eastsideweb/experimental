using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace LogProcessorSample
{
    class MyConsole
    {
        const ConsoleColor ccError = ConsoleColor.Red;
        const ConsoleColor ccNormal = ConsoleColor.Green;
        const ConsoleColor ccBackground = ConsoleColor.Black;

        public static void Initialize()
        {
            Console.BackgroundColor = ccBackground;
            Console.ForegroundColor = ccNormal;
        }

        public static void WriteLine(Object o)
        {
            Trace.WriteLine("[CONS-ERROR] " + o);
            Console.WriteLine(o);
        }

        public static void WriteError(Object o)
        {
            Trace.WriteLine("[CONS-ERROR] " + o);
            Console.ForegroundColor = ccError;
            Console.WriteLine(o);
            Console.ForegroundColor = ccNormal;
        }
    }
}
