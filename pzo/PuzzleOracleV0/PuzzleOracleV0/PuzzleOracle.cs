using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{
    class PuzzleOracle
    {
        Dictionary<String, PuzzleInfo> puzzles;
        public PuzzleOracle(SimpleSpreadsheetReader sr)
        {
            puzzles = new Dictionary<string, PuzzleInfo>();
            addPuzzles(sr);
        }

        public string tryGetName(string puzzleId)
        {
            if (puzzleId == "007") return "Golden Eye";
            return null;
        }

        public PuzzleResponse checkSolution(string puzzleId, string solution)
        {
            // TODO: Normalize solution...
            // Actually lookup the puzzle...

            if (puzzleId != "007")
            {
                throw new KeyNotFoundException("no such puzzleId: " + puzzleId);
            }

            if (solution == "ABC")
            {
                return new PuzzleResponse(PuzzleResponse.ResponseType.Correct, "CONGRATULATIONS!");
            }
            else
            {
                return new PuzzleResponse(PuzzleResponse.ResponseType.Incorrect, "NOPE!");
            }
        }

        private void addPuzzles(SimpleSpreadsheetReader sr)
        {
           
        }
    }
}
