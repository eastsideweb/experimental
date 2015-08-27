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
            return null;
        }

        public PuzzleResponse checkSolution(string puzzleId)
        {
            return null;
        }

        private void addPuzzles(SimpleSpreadsheetReader sr)
        {
            throw new NotImplementedException();
        }
    }
}
