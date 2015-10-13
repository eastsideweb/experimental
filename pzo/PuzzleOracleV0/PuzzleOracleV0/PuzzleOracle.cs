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
        public PuzzleOracle(SimpleSpreadsheetReader sr)
        {
            puzzles = new Dictionary<string, PuzzleInfo>();
            addPuzzles(sr);
        }

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

        public PuzzleResponse checkSolution(string puzzleId, string solution)
        {
            // TODO: Normalize solution...
            // Actually lookup the puzzle...
            solution = normalizeSolution(solution);
#if false
            if (puzzleId != "007")
            {
                throw new KeyNotFoundException("no such puzzleId: " + puzzleId);
            }

            if (solution == "ABC")
            {
                return new PuzzleResponse(solution, PuzzleResponse.ResponseType.Correct, "CONGRATULATIONS!");
            }
            else
            {
                return new PuzzleResponse(solution ,PuzzleResponse.ResponseType.Incorrect, "NOPE!");
            }
#endif
            PuzzleInfo pi = puzzles[puzzleId];
            PuzzleResponse pr = pi.matchResponse(solution);
            if (pr == null)
            {
                pr = new PuzzleResponse(solution, PuzzleResponse.ResponseType.Incorrect, "NOPE!");
            }
            return pr;
        }

        private string normalizeSolution(string solution)
        {
            String s = Regex.Replace(solution, @"(\s+)|([\\.,:!""']+)", "");
            Trace.WriteLine(String.Format("Normalizing solution [{0}] into [{1}]", solution, s));
            return s;
        }

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
                try
                {
                    puzzles.Add(id, new PuzzleInfo(id, name, answer));
                    Trace.WriteLine(String.Format("Adding row {0}: Puzzle ID {1}, Answer {2}", i, id, answer));

                }
                catch (ArgumentException)
                {
                    Trace.WriteLine(String.Format("Ignoring row {0}: Duplicate ID {1}", i, id));
                }

            }
           
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
