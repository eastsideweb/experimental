//
// MODULE: Puzzle Oracle - for A Puzzle Oracle for Puzzle Events
// File: PuzzleOracle.cs
//
// HISTORY
//   September 2015 Joseph M. Joy Created

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace PuzzleOracleV0
{
    class PuzzleOracle
    {
        const String SPREADSHEET_LABEL_ID = "ID";
        Dictionary<String, PuzzleInfo> puzzles;

        // If present in the responses (after the ':') they are expanded into their corresponding long-form text.
        String[,] responseAliases = {
{"_C", "Correct!"},
{"_KG", "Keep going. You're on the right track."},
{"_WT", "You're on the wrong track."}
                                  };
        public PuzzleOracle(SimpleSpreadsheetReader sr)
        {
            puzzles = new Dictionary<string, PuzzleInfo>();
            addPuzzles(sr);
        }

        /// <summary>
        /// Attempts to lookup a puzzle name by ID. Returns null if not found.
        /// </summary>
        public string tryGetName(string puzzleId)
        {
            //if (puzzleId == "007") return "Golden Eye";
            PuzzleInfo pi;
            if (puzzles.TryGetValue(puzzleId, out pi))
            {
                return pi.puzzleName;
            }
            return null;
        }

        /// <summary>
        /// Constructs a response for the user-generated solution. puzzleId
        /// MUST reference a valid puzzle else a KeyNotFound exception is 
        /// thrown (call tryGetName first if not sure).
        /// </summary>
        /// <param name="puzzleId"></param>
        /// <param name="solution"></param>
        /// <returns></returns>
        public PuzzleResponse checkSolution(string puzzleId, string solution)
        {
            // TODO: Normalize solution...
            // Actually lookup the puzzle...
            solution = normalizeSolution(solution);
            PuzzleInfo pi = puzzles[puzzleId];
            PuzzleResponse pr = pi.matchResponse(solution);
            if (pr == null)
            {
                pr = new PuzzleResponse(solution, PuzzleResponse.ResponseType.Incorrect, "NOPE!");
            }
            return pr;
        }

        /// <summary>
        /// Upper-cases and strips extraneous characters from the user solution.
        /// </summary>
        private string normalizeSolution(string solution)
        {
            String s = Regex.Replace(solution, @"(\s+)|([\\.,:!""'-]+)", "");
            s = s.ToUpperInvariant();
            Trace.WriteLine(String.Format("Normalizing solution [{0}] into [{1}]", solution, s));
            return s;
        }

        /// <summary>
        /// Adds all puzzles in the specified spreadsheet. Individual puzzles may not
        /// be added for a variety of reasons including:
        ///     - Duplicate Puzzle ID (only first one gets added)
        ///     - Empty answer field.
        ///     - Invalid REGEX field in answer or hints.
        /// Errors are reported as Trace output.
        /// TODO: Have a systematic way to report skipped puzzles.
        /// </summary>
        /// <param name="sr"></param>
        private void addPuzzles(SimpleSpreadsheetReader sr)
        {
            // Find origin by looking for "Id" (ignoring case)
            int startRow = -1;
            int startCol = -1;
            int sheet = 0;
            int numRows = sr.getNumRows(sheet);
            int numCols = sr.getNumCols(sheet);
            if (numRows < 2 || numCols < 3)
            {
                Trace.WriteLine("spread sheet is too small!");
                return;
            }
            String[] header = sr.getRowCells(0, 0, numCols - 1, sheet);
            // We expect the first cell to be "id"
            String headerId = stripEndBlanks(header[0]);
            if (!headerId.Equals(SPREADSHEET_LABEL_ID, StringComparison.CurrentCultureIgnoreCase))
            {
                Trace.WriteLine("spread sheet 1st cell is not 'ID'");
                return;
            }
            startRow = 1; startCol = 0; // for now we hardcode the location of the puzzle rows w.r.t. spreadsheet origin - 2nd row onwards is puzzles.
            for (int i = startRow; i < numRows; i++)
            {
                String[] sRow = sr.getRowCells(i, startCol, numCols - 1, sheet);
                const String REGEX_ID = @"^[0-9][0-9][0-9]$"; // For now, IDs must be 3-digit numbers.
                String id = stripBlanks(sRow[0]);
                 if (!Regex.IsMatch(id, REGEX_ID))
                {
                    Trace.WriteLine(String.Format("Skipping row {0}: invalid ID", i));
                    continue;
                }
  
                // We got the ID, now let's get the remaining columns. For now, let's just get Name and Answer.
                String name = stripEndBlanks(sRow[1]);
                String answer = stripEndBlanks(sRow[2]);
                // Neither should be blank.
                if (name.Equals("") || answer.Equals(""))
                {
                    Trace.WriteLine(String.Format("Skipping row {0}: blank Name or Answer", i));
                    continue;
                }

                PuzzleResponse pAnswerResponse = buildPuzzleResponse(answer, PuzzleResponse.ResponseType.Correct);
                if (pAnswerResponse == null)
                {
                    Trace.WriteLine(String.Format("Skipping row {0}: Invalid Answer", i));
                    continue;
                }
                PuzzleInfo pi = new PuzzleInfo(id, name);
                pi.addResponse(pAnswerResponse);

                // Add hints, if any...
                for (int j = 3; j < sRow.Length; j++)
                {
                    PuzzleResponse pr = buildPuzzleResponse(sRow[j], PuzzleResponse.ResponseType.Incorrect);
                    if (pr == null)
                    {
                        Trace.WriteLine(String.Format("Ignoring hint {0} on row {1}: Invalid hint content {2}", j, i));
                    }
                    pi.addResponse(pr);
                }

                try
                {

                    puzzles.Add(id, pi);
                    Trace.WriteLine(String.Format("Adding row {0}: Puzzle ID {1}, Answer {2}", i, id, answer));

                }
                catch (ArgumentException)
                {
                    Trace.WriteLine(String.Format("Ignoring row {0}: Duplicate ID {1}", i, id));
                }

            }
           
        }


        /// <summary>
        /// Expands the compactified string representation of a response into REGEX pattern and expanded
        /// responses - returned as a PuzzleResponse object. Returns null if there was a parse error (including
        /// invalid Regex pattern.)
        /// </summary>
        /// <param name="s"></param>
        /// <param name="responseType"></param>
        /// <returns></returns>
        private PuzzleResponse buildPuzzleResponse(string s, PuzzleResponse.ResponseType responseType)
        // Format REGEX[:HINT]
        {
            String pattern = ""; // REGEX pattern that matches the user-supplied solution.
            String response = "";
            int i = s.IndexOf(":");
            if (i >= 0)
            {
                pattern = s.Substring(0, i);
                response = s.Substring(i + 1); // can be ""
            } else {
                pattern = s;
            }
            pattern = stripEndBlanks(pattern);
            response = stripEndBlanks(response);

            // Verify that the pattern is a valid Regex pattern!
            if (pattern.Length == 0)
            {
                Trace.WriteLine("Empty pattern - ignoring response.");
                return null;
            }

            try
            {
               Regex.IsMatch("foo", pattern);
            }
            catch (ArgumentException)
            {
                Trace.WriteLine(String.Format("Ignoring pattern: Invalid REGEX '{0}'", pattern));
                return null;
            }

            // Expand any aliases in response.
            response = expandAliases(response);

            return new PuzzleResponse(pattern, responseType, response);
         }

        /// <summary>
        /// Expands embedded aliases (such as _KG) in-place. The alias table is responseAliases.
        /// </summary>
        /// <param name="response"></param>
        /// <returns></returns>
        private  string expandAliases(string response)
        {
            int numAliases = responseAliases.GetUpperBound(0);
            for (int i = 0; i <= numAliases; i++)
            {
                String alias = responseAliases[i, 0];
                String expansion = responseAliases[i, 1];
                response = Regex.Replace(response, alias, expansion);
            }
            return response; 
        }

        private string stripEndBlanks(string s)
        {
            return Regex.Replace(Regex.Replace(s, @"^\s+", ""), @"\s+$", "");
        }

        private string stripBlanks(string s)
        {
            return Regex.Replace(s, @"\s+", "");
        }
    }
}
