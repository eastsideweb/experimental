using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace PuzzleOracleV0
{
    /// <summary>
    /// Provides information about a single puzzle.
    /// </summary>
    class PuzzleInfo
    {
        public PuzzleInfo(String id, String name, String answer)
        {
            puzzleId = id;
            puzzleName = name;
            previousQueryTime = new DateTime(2015, 1, 1); // some time in the past
            responses = new PuzzleResponse[1];
            PuzzleResponse pr = new PuzzleResponse(answer, PuzzleResponse.ResponseType.Correct, "CONGRATULATIONS!");
            responses[0] = pr;
        }

        public readonly string puzzleId;
        public readonly string puzzleName;
        public DateTime previousQueryTime;
 
        public PuzzleResponse matchResponse(String userSolution)
        {
            foreach (PuzzleResponse pr in responses)
            {
                if (Regex.IsMatch(userSolution, pr.pattern))
                {
                    return pr;
                }
            }
            return null;
        }

        private PuzzleResponse[] responses;

    }
}
