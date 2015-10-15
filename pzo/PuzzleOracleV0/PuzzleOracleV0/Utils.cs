using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Diagnostics;
using System.IO;

namespace PuzzleOracleV0
{
    class Utils
    {
        /// <summary>
        /// Returns the current time in UTC (university coordinated time) in standard UTC time format (http://www.w3.org/TR/NOTE-datetime).
        /// </summary>
        /// <returns></returns>
        public static String getUTCTimeCode()
        {
            // / UTC web format - From stackoverflow example
            String timeStamp = DateTime.Now.ToUniversalTime()
             .ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fffK");
            return timeStamp;
        }
        /// <summary>
        /// Get's the team info (id, name) associated with the machine, if found. Returns null otherwise.
        /// Throws ArgumentException if there is an issue with the spreadsheet data.
        /// </summary>
        /// <param name="teamInfoSpreadsheet"></param>
        /// <returns></returns>
        public static TeamInfo getTeamInfoForMachine(String teamInfoPathName, String teamId)
        {
            SimpleSpreadsheetReader teamInfoSpreadsheet = CsvExcelReader.loadSpreadsheet(teamInfoPathName);
             TeamInfo info = null;
            // We expect the order of info in the spreadsheet to be:
            //   TeamID, TeamName, ...
            // Also, the 1st row is expected to be properties and the 2nd row to be the header.
            if (!quickSpreadsheetCheck(teamInfoSpreadsheet, "PTD", 2, 2))
            {
                String message = "Does not appear to be a valid team info spreadsheet - signature missing or invalid";
                ErrorReport.logError(message);

                throw new ArgumentException(message);
            }

            // Start at 2 to skip properties and header rows.
            for (int r = 2; r < teamInfoSpreadsheet.getNumRows(); r++)
            {
                String[] row = teamInfoSpreadsheet.getRowCells(r, 0, 2);
                String tId = stripEndBlanks(row[0]);
                if (teamId.Equals(tId))
                {
                    // Found it!             
                    String teamName = stripEndBlanks(row[1]);
                    info = new TeamInfo(teamId, teamName);
                    break;
                }
            }
            return info;
        }


        /// <summary>
        /// Does a quick check on the validity of the spreasheet.
        /// </summary>
        /// <param name="teamInfoSpreadsheet"></param>
        /// <param name="cell1">Value of cell at [0,0]</param>
        /// <param name="minRows">Minimum number of rows</param>
        /// <param name="minCols">Minimum number of columns</param>
        /// <returns></returns>
        private static bool quickSpreadsheetCheck(SimpleSpreadsheetReader teamInfoSpreadsheet, string cell1, int minRows, int minCols)
        {
            minRows = Math.Max(minRows, 2);
            minCols = Math.Max(minCols, 1);

            if (teamInfoSpreadsheet.getNumRows() < minRows || teamInfoSpreadsheet.getNumCols() < minCols)
            {
                Trace.WriteLine("Spreadsheet dimensions too small.");
                return false;
            }
            String[] cells = teamInfoSpreadsheet.getRowCells(0, 0, 0);
            String c1 = stripEndBlanks(cells[0]);
            if (!c1.Equals(cell1))
            {
                Trace.WriteLine("Cell 1 (signature) is incorrect.");
                return false;
            }
            return true;
        }


        public static string stripEndBlanks(string s)
        {
            return Regex.Replace(Regex.Replace(s, @"^\s+", ""), @"\s+$", "");
        }

        public static string stripBlanks(string s)
        {
            return Regex.Replace(s, @"\s+", "");
        }


        /// <summary>
        /// Returns upper-cased version, with only alnum chars as well as . - and _
        /// </summary>
        /// <param name="mname"></param>
        /// <returns></returns>
        static String normalizeMachineName(String mname)
        {
            String s = Regex.Replace(mname.ToUpperInvariant(), "[^0-9A-Z_.-]", "");
            return s;
        }

        

        /// <summary>
        /// Will either return a valid team ID or throw an exception.
        /// </summary>
        /// <param name="teamIdPathName"></param>
        /// <returns></returns>
        internal static String getCurrentTeamId(string teamIdPathName)
        {
            String teamId = null;

            try
            {
                using (TextReader tr = new StreamReader(teamIdPathName))
                {
                    String allText = tr.ReadToEnd();
                    // Expected format: teamID, team name.

                    teamId = Utils.stripEndBlanks(allText).ToUpperInvariant();
                        
                    if (!Utils.isValidTeamId(teamId))
                    {
                        ErrorReport.logError(String.Format("Team override file [{0}]present but has invalid content.", teamIdPathName));
                        throw new ApplicationException("Invalid team-id file");
                    }
                }
            }
            catch (FileNotFoundException e)
            {
                ErrorReport.logError(String.Format("Team override file [{0}] is not present.\nPlease create one that contains the current team ID.", teamIdPathName));
                throw new ApplicationException("Missing team-id file");
            }

            return teamId;
        }

        public static bool isValidTeamId(string teamId)
        {
            return Regex.IsMatch(teamId, "^T[0-9]+$"); // Note it has to be upper-case T. 
        }
    }
}
