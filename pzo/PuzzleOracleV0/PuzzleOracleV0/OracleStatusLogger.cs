using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.RegularExpressions;

namespace PuzzleOracleV0
{
    class OracleStatusLogger : IDisposable
    {
        const String META_PUZZLE_ID = "999";
 
        TextWriter tw = null;
        readonly String teamId;
        readonly String teamName;

        public OracleStatusLogger(String logPathName, String teamId, String teamName)
        {
            if (!Regex.IsMatch(teamId, "^[0-9]+$"))
            {
                throw new ArgumentException("Team ID is malformed - should be all digits: " + teamId);
            }
            teamName = Regex.Replace(teamName, "[\"',\\n\\r]", "");  // remove some troublesome characters if they happen to be there.
            this.teamId = teamId;
            this.teamName = teamName;
            tw = new StreamWriter(logPathName, true); // true == append

            logMetaSatus("LOG_STARTED");

        }

        private void logMetaSatus(string status)
        {
            LogSolveAttempt(META_PUZZLE_ID, status, new PuzzleResponse("", PuzzleResponse.ResponseType.Correct, ""));
        }

        public void LogSolveAttempt(String puzzleId, String attemptedSolution, PuzzleResponse response)
        {
            // We log the normalized attempt so that it doesn't have extraneous characters.
            attemptedSolution = PuzzleOracle.normalizeSolution(attemptedSolution);
            // As an extra caution, strip out commas and double quotes (these should be stripped, but just in case...)
            attemptedSolution = Regex.Replace(attemptedSolution, "[,\"]", "");

            String responseCode = "INVALID";
            switch (response.type)
            {
                case PuzzleResponse.ResponseType.AskLater:
                    responseCode = "BLACKLISTED";
                    break;
                case PuzzleResponse.ResponseType.Correct:
                    responseCode = "CORRECT";
                    break;
                case PuzzleResponse.ResponseType.Incorrect:
                    responseCode = "INCORRECT"; // INCORRET means it matched a hint.
                    break;
                case PuzzleResponse.ResponseType.NotFound:
                    responseCode = "NOTFOUND";
                    break;
                default:
                    responseCode = "UNRECOGNIZED_CODE";
                    break;
            }
            String timeStamp = DateTime.Now.ToUniversalTime()
                         .ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fffK"); // UTC web format - From stackoverflow example
            tw.WriteLine(timeStamp + "," + teamId + "," + teamName + "," + puzzleId + "," + responseCode + "," + attemptedSolution);
            tw.Flush();
        }

        public void Dispose()
        {
            if (tw != null)
            {
                logMetaSatus("LOG_STOPPED");
                tw.Flush(); // sync
                tw.Dispose();
                tw = null;
            }
        }
    }
}
