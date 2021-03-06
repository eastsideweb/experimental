﻿using System;
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
        const ConsoleColor ccNormal = ConsoleColor.White;
        const ConsoleColor ccWarning = ConsoleColor.Yellow;
        const ConsoleColor ccBackground = ConsoleColor.Black;

        public static void Initialize()
        {
            Console.BackgroundColor = ccBackground;
            Console.ForegroundColor = ccNormal;
        }

        public static void WriteLine(Object o)
        {
            Trace.WriteLine("[CONS] " + o);
            Console.WriteLine(o);
        }

        public static void WriteError(Object o)
        {
            Trace.TraceError("[CONS-ERROR] " + o);
            Console.ForegroundColor = ccError;
            Console.WriteLine(o);
            Console.ForegroundColor = ccNormal;
        }

        public static void WriteWarning(Object o)
        {
            Trace.TraceWarning("[CONS-WARN] " + o);
            Console.ForegroundColor = ccWarning;
            Console.WriteLine(o);
            Console.ForegroundColor = ccNormal;
        }
    }
}
