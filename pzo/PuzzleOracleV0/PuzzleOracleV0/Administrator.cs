using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace PuzzleOracleV0
{
    class Administrator
    {

        // Build puzzle-specific extended response that gives instructions on next steps,
        // given the player's puzzle response.
        public static string buildExtendedResponse(string id, PuzzleResponse pr)
        {
            if (pr.code != PuzzleResponse.ResponseCode.Correct)
            {
                return "";
            }
            String response = "";

            String[,] challengeInfo = {
                {"101", "XBQ"}
            };
            String[,] questInfo = {
                {"101", "XBQ"}
            };

            Char c = id[2];
            int i2 = c - '0';
            Debug.Assert(i2 >= 0 && i2 <= 9);
            if (i2 % 2 == 0)
            {
                if (i2 % 4 != 0)
                {
                    // Challenge
                    response = pr.response + " Go on Challenge ABC";
                }
                else
                {
                    response = pr.response + " Go on Quest XYZ";
                }
            }

            return response;
        }
    }
}
