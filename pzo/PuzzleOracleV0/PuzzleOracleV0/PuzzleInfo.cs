using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{
    /// <summary>
    /// Provides information about a single puzzle.
    /// </summary>
    class PuzzleInfo
    {
        public PuzzleInfo(String[] puzzleRow)
        {
            puzzleId = puzzleRow[0];
            puzzleName = puzzleRow[1];
            previousQueryTime = new DateTime(2015, 1, 1); // some time in the past
            responses = new Dictionary<string, PuzzleResponse>();

            // Add all the responses from the 3rd row onwards...
            addResponses(puzzleRow);
        }

        private void addResponses(string[] puzzleRow)
        {
            throw new NotImplementedException();
        }
        public readonly string puzzleId;
        public readonly string puzzleName;
        public DateTime previousQueryTime;
        public  Dictionary<String, PuzzleResponse> responses;
    }
}
