using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace PuzzleOracleV0
{
    /// <summary>
    /// Contains information returned by the Oracle in response to a user solution.
    /// </summary>
    class PuzzleResponse
    {
        public enum ResponseCode
        {
            Correct,
            Incorrect,
            NotFound,
            AskLater,
            AskNever
        };


        public PuzzleResponse(String pattern, ResponseCode code, String response)
        {
            this.pattern = pattern;
            this.code = code;
            this.response = response;
            this.workingPattern = "^" + Regex.Replace(pattern, @"^\^|\$$", "") + "$"; // Make sure we match the whole string.
        }

        public readonly String pattern;
        public readonly ResponseCode code;
        public readonly string response;
        public readonly string workingPattern;

    }
}
