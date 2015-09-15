using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Diagnostics;

namespace PuzzleOracleV0
{
    class Utils
    {
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

                    // FOR NOW - we expect team ID to be a digit sequence.
                    if (!Regex.IsMatch(teamId, "^[0-9]+$"))
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
    }
}
