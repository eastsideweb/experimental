﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{
    /// <summary>
    /// Contains information returned by the Oracle in response to a user solution.
    /// </summary>
    class PuzzleResponse
    {
        public enum ResponseType
        {
            Correct,
            Incorrect,
            AskLater
        };

        public PuzzleResponse(ResponseType type, String response)
        {
            this.type = type;
            this.response = response;
        }

        public readonly ResponseType type;
        public readonly string response;
    }
}