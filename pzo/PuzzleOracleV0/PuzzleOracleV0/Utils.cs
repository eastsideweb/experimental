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
                String[] row = teamInfoSpreadsheet.getRowCells(r, 0, 1);
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
                        String msg = String.Format("Team ID file [{0}] is present but does not contain a valid team ID.", teamIdPathName)
                            + " A valid team ID has a 'T' (without quotes) followed by team number (example: T2).";
                        ErrorReport.logError(msg);
                        throw new ApplicationException("Invalid team-id file");
                    }
                }
            }
            catch (FileNotFoundException e)
            {
                ErrorReport.logError(String.Format("Team ID file [{0}] is not present. Please create one that contains the current team ID (example: T2).", teamIdPathName));
                throw new ApplicationException("Missing team-id file");
            }

            return teamId;
        }

        public static bool isValidTeamId(string teamId)
        {
            return Regex.IsMatch(teamId, "^T[0-9]+$"); // Note it has to be upper-case T. 
        }

        // ADD a cell  - assumes the 1st cell in the row has already been written.
        // Escapes s if needed.
        public static void appendCsvCell(TextWriter tw, String s)
        {
            const String q = "\"";
            const String qq = q + q;
            if (Regex.IsMatch(s, @"\n|\r|,|"""))
            { // removed \s for space because it seems space in cells is not quoted.
                // S needs excaping.
                s = Regex.Replace(s, q, qq);
                s = q + s + q;
            }
            tw.Write("," + s);
        }

        public static void writeCsvCommas(TextWriter tw, int n)
        {
            // Write extra commas if required
            for (int i = 0; i < n; i++)
            {
                tw.Write(",");
            }
        }

        public static T selectRandomElemement<T>(Random rand, List<T> elements)
        {
            return elements[rand.Next(0, elements.Count)];
        }

        public static T removeRandomElemement<T>(Random rand, List<T> elements)
        {
            int n = rand.Next(0, elements.Count);
            T element = elements[n];
            elements.Remove(element);
            return element;
        }

        public static int pickRandomPortion(Random rand, int items, int partitions)
        {
            int portion = items;
            if (partitions > 1)
            {
                // We attempt to spread out (on average) the items over the multiple partitions.
                double d = rand.NextDouble() * items / partitions;
                portion = (int)d;

                // There may be a fractional part left - we add 1 item with appropriate
                // probability to approximate this factional part over all partitions.
                d -= portion; // fraction part left
                if (portion < items && rand.NextDouble() < d)
                {
                    portion++;
                }
            }
            return portion;
        }
    }
}
