using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Diagnostics;

namespace LogProcessorSample
{
    class Utils
    {
        public static void createDirIfNeeded(String dir, Boolean critical) {
            try
            {
                // If directory do not exist, create it.
                if (!Directory.Exists(dir))
                {
                    MyConsole.WriteLine(String.Format("Creating directory [{0}].", dir));
                    Directory.CreateDirectory(dir);
                }
            }
            catch (IOException e)
            {
                String msg = String.Format("Error [{0}] attempting to create director [{1}]", e.ToString(), dir);
                MyConsole.WriteError(msg);
                if (critical)
                {
                    Trace.WriteLine("Throwing application exception on critical error: " + msg);
                    throw new ApplicationException(msg);
                }
            }
        }

        /// <summary>
        /// Check if the two (text) files have the same content.
        /// </summary>
        /// <param name="p"></param>
        /// <param name="destPath"></param>
        /// <returns></returns>
        internal static bool filesHaveSameContent(string f1, string f2)
        {
            bool match = false;
            // We don't attempt to be efficient - simply read the entire text and compare them!
            try
            {
                using (TextReader tr1 = new StreamReader(f1), tr2 = new StreamReader(f2))
                {
                    String allText1 = tr1.ReadToEnd();
                    String allText2 = tr2.ReadToEnd();
                    tr1.Close();
                    tr2.Close();
                    match = allText1.Equals(allText2);
                } 
            }
            catch (IOException e)
            {
                MyConsole.WriteError(String.Format("IO Exception attempting to compare two files[{0}] and [{1}]: {2}", f2, f2, e));
            }
            return match;
        }


        // Write content to the file, overwriting if it exists.
        // This is a dangerous utility function, so we restrict it to writing paths that have PuzzleOracle as one of
        // the sub-dirs
        internal static void writeTextFile(string path, string content)
        {
            // This is a potentially dange
            if (path.IndexOf(Program.LOG_PROCESSOR_SUBDIR + "\\") == -1)
            {
                MyConsole.WriteError("INTERNAL ERROR!");
                throw new ApplicationException("We don't write random files!");
            }
            using (TextWriter tr = new StreamWriter(path, false)) // false == do NOT append
            {
                tr.Write(content);
                tr.Close();
            }
        }
    }
}
