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
        static int warningCount = 0;
        static int errorCount = 0;

        static List<String> log = new List<string>();
        public static void init()
        {

        }

        public static void logError(String s)
        {
            internalLog(ERROR + s);
            errorCount++;
        }
        public static void logWarning(String s)
        {
            internalLog(WARNING + s);
            warningCount++;
        }
        static void internalLog(String s)
        {
            log.Add(s);
        }

        static bool hasWarningsOrErrors()
        {
            return errorCount + warningCount > 0;
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
