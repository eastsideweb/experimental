using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{
    class ErrorReport
    {
        const String WARNING = "WARNING: ";
        const String ERROR = "ERROR: ";

        static List<String> log = new List<string>();
        public static void init()
        {

        }

        public static void logError(String s)
        {
            internalLog(ERROR + s);
        }
        public static void logWarning(String s)
        {
            internalLog(WARNING + s);
        }
        static void internalLog(String s)
        {
            log.Add(s);
        }

        public static String getLogAsText()
        {
            String text = "";
            foreach (String s in log)
            {
                text += s + "\n";
            }
            return text;
        }
    }
}
