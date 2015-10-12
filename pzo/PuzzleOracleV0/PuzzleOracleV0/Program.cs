using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;

namespace PuzzleOracleV0
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            //Debug.Fail("Break into debugger!");
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Form1 f = new Form1();
            try
            {
                Application.Run(f);
            }
            catch (ApplicationException e)
            {
                f.handleFatalError(e);
            }
        }
    }
}
