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
        public static TeamInfo getTeamInfoForMachine(SimpleSpreadsheetReader teamInfoSpreadsheet)
        {
            String machineName = normalizeMachineName(Environment.MachineName);
            TeamInfo info = null;
            // We expect the order of info in the spreadsheet to be:
            //   TeamID, TeamName, MachineName, ...
            // Also, the 1st row is expected to be properties and the 2nd row to be the header.
            if (!quickSpreadsheetCheck(teamInfoSpreadsheet, "PTD", 2, 3))
            {
                throw new ArgumentException("Does not appear to be a valid team info spreadsheet");
            }

            // Start at 1 to skip header row.
            for (int r = 1; r < teamInfoSpreadsheet.getNumRows(); r++)
            {
                String[] row = teamInfoSpreadsheet.getRowCells(r, 0, 2);
                String machineName_r = normalizeMachineName(row[2]);
                if (machineName.Equals(machineName_r))
                {
                    // Found it!
                    String teamId = stripEndBlanks(row[0]);
                    String teamName = stripEndBlanks(row[1]);

                    // We expect team ID to be T followed by a digit sequence.
                    if (!Regex.IsMatch(teamId, "^T[0-9]+$"))
                    {
                        throw new ArgumentException(String.Format("Matched Team ID doesn't appear to be a valid team ID (row={0})", r));
                    }
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
        /// Checks if there is a team name to use regardless of machhine name...
        /// </summary>
        /// <param name="teamOverridePathName"></param>
        /// <returns></returns>
        internal static TeamInfo getOverrideTeamInfo(string teamOverridePathName)
        {
            TeamInfo info = null;

            try
            {
                using (TextReader tr = new StreamReader(teamOverridePathName))
                {
                    String allText = tr.ReadToEnd();
                    // Expected format: teamID, team name.

                    int commaPos = allText.IndexOf(',');
                    if (commaPos != -1)
                    {
                        String teamId = Utils.stripEndBlanks(allText.Substring(0, commaPos));
                        String teamName = Utils.stripEndBlanks(allText.Substring(commaPos + 1));
                        if (teamId.Length != 1 && teamName.Length != 1)
                        {
                            info = new TeamInfo(teamId, teamName);
                        }
                    }
                    if (info == null)
                    {
                        ErrorReport.logError(String.Format("Team override file [{0}]present but has invalid content.", teamOverridePathName));
                    }
                }
            }
            catch (FileNotFoundException e)
            {
                return null;
            }

            return info;
        }
    }
}
