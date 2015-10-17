//
// MODULE: Puzzle Oracle - for A Puzzle Oracle for Puzzle Events
// File: PuzzleInfo
//
// HISTORY
//   September 2015 Joseph M. Joy Created
//
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
        public PuzzleInfo(String id, String name)
        {
            puzzleId = id;
            puzzleName = name;
            responses = new List<PuzzleResponse>();
            blacklister = new Blacklister(id);
        }

        public readonly string puzzleId;
        public readonly string puzzleName;
        public readonly List<PuzzleResponse> responses;
        public Boolean puzzleSolved = false;
        public Blacklister blacklister;

        public PuzzleResponse matchResponse(String userSolution)
        {
            foreach (PuzzleResponse pr in responses)
            {
                if (Regex.IsMatch(userSolution, pr.workingPattern))
                {
                    return pr;
                }
            }
            return null;
        }

        public void addResponse(PuzzleResponse pr)
        {
            responses.Add(pr);
        }


    }
}
