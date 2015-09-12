﻿//
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
            previousQueryTime = new DateTime(2015, 1, 1); // some time in the past
            responses = new List<PuzzleResponse>();
        }

        public readonly string puzzleId;
        public readonly string puzzleName;
        public DateTime previousQueryTime;
        public readonly List<PuzzleResponse> responses;

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

        public void addResponse(PuzzleResponse pr)
        {
            responses.Add(pr);
        }


    }
}
