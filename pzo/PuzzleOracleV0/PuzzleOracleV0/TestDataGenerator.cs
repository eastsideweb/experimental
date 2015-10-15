using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.RegularExpressions;
using System.Diagnostics;

namespace PuzzleOracleV0
{
    class TestDataGenerator
    {
        const String MODULE = "TDG: "; // For tracing

        /// <summary>
        /// This is for test purposes only - it generates test log data to the specified directory.
        /// These data files have NOTHING to do with this instance of puzzle oracle. Current team ID, puzzle-data etc are ignored.
        /// In fact, we create multiple instances of the oracle logger and write random submission logs to them!
        /// </summary>
        /// <param name="testLogDirName"></param>
        internal static void generateTestLogData(String testLogDirName)
        {
            const int NUMBER_OF_TEAMS = 10;
            const int NUMBER_OF_PUZZLES = 100;
            const int START_PUZZLE_NUMBER = 100;
            const int START_TEAM_NUMBER = 1;
            const int MAX_TEAM_NAME_LENGTH = 50;
            const int MIN_ATTEMPTS_PER_PUZZLE = 0;   // However if a team must solve it will generate one (correct) solution.
            const int MAX_ATTEMPTS_PER_PUZZLE = 10; // Per team.
            Random rand = new Random();

            try
            {
                // We only generate test data if the directory is empty.
                var files = Directory.EnumerateFiles(testLogDirName, "*.csv").ToArray();
                if (files.Length > 0)
                {
                    ErrorReport.logError(String.Format("Test log directory [{0}] is NOT empty. NOT generating any test logs. Please clean the directory and try again.", testLogDirName));
                    return; //       ********** EARLY RETURN **************
                }
                
                for (int i = 0; i < NUMBER_OF_TEAMS; i++)
                {
                    int teamNumber = (i + START_TEAM_NUMBER);
                    String teamId = "T" + teamNumber;
                    String teamName = generateRandomTeamName(teamId, MAX_TEAM_NAME_LENGTH);
                    OracleSubmissionLogger logger = new OracleSubmissionLogger(testLogDirName, teamId, teamName);
                    for (int j = 0; j < NUMBER_OF_PUZZLES; j++)
                    {
                        int puzzleNumber = j + START_PUZZLE_NUMBER;
                        String puzzleId = "" + puzzleNumber;
                        Debug.Assert(puzzleId.Length == 3); // Puzzle IDs are expecte to be a 3-digit number.
                        bool shouldSolve = ((puzzleNumber % 100) % teamNumber) == 0; // Last 2 digits of puzzle number must be a multiple of team number.
                        int numAttempts = rand.Next(MIN_ATTEMPTS_PER_PUZZLE, MAX_ATTEMPTS_PER_PUZZLE + 1);
                        if (numAttempts == 0 && shouldSolve)
                        {
                            numAttempts = 1;
                        }
                        bool solved = false;
                        for (int k = 0; k < numAttempts; k++)
                        {
                            bool solve = shouldSolve && (rand.NextDouble() < 1.0 / numAttempts);
                            solved = solved || solve;
                            // If we've we've got one more attempt and we haven't solved but we need to solve it, we solve it!
                            if ((k == (numAttempts - 1)) && shouldSolve && !solved)
                            {
                                solved = solve = true;
                            }
                            String solutionAttempt = generateRandomSolutionAttempt(rand, puzzleId, solve);
                            PuzzleResponse pr = generateRandomResponse(rand, puzzleId, solutionAttempt);
                            logger.logSolveAttempt(puzzleId, solutionAttempt, pr);
                        }
                        Debug.Assert((!shouldSolve && !solved) || (shouldSolve && solved));
                    }
                    logger.Dispose();
                }
            }
            catch (ApplicationException ex)
            {
                ErrorReport.logError("Internal error attempting to write test log data. Can't guarantee the data are correct.");
                Trace.TraceError(MODULE + "Exception attempting to generate test log data. Ex: " + ex);
            }
        }

        private static string generateRandomSolutionAttempt(Random rand, string puzzleId, bool solve)
        {
            // Correct: PNA where N is puzzle number.
            // Hint M: PNHM, where N is puzzle number and N is hint number. Number of correct hints == puzzle Id mod 10.
            string attempt = "";
            if (solve)
            {
                attempt = "P" + puzzleId + "A";
            }
            else
            {
                if (rand.Next(0, 2) == 0) {
                    attempt =  "P" + puzzleId + "H" + rand.Next(1,10); // hint. May not be there for this puzzle.
                }
                else {
                    attempt = "x"; // not found
                }
            }

            attempt += randomAnswerText(rand);

            return attempt;
        }

        private static string randomAnswerText(Random rand)
        {
            const int MAX_RANDOM_ADDON_TEXT  = 10;
            int numChars = rand.Next(1, MAX_RANDOM_ADDON_TEXT+1);
            return  CryptoHelper.generateRandomSafeBase64string(rand.Next(), numChars);
;
        }

        private static PuzzleResponse generateRandomResponse(Random rand, string puzzleId, string solutionAttempt)
        {
            PuzzleResponse pr = null;
             String answer = "P" + puzzleId + "A";
            String hintRegex = "^P" + puzzleId + "H" + "[0-9]";

            solutionAttempt = PuzzleOracle.normalizeSolution(solutionAttempt);
            if (solutionAttempt.IndexOf(answer)==0)
            {
                pr = new PuzzleResponse("^" + answer, PuzzleResponse.ResponseType.Correct, "Correct!");
            }
            else if (Regex.IsMatch(solutionAttempt, hintRegex))
            {
                int puzzleDigit = puzzleId[2] - '0';
                Debug.Assert(puzzleDigit >= 0 && puzzleDigit <= 9);
                int hintNumber = solutionAttempt[5]-'0'; // The M in PNNNHM
                if (hintNumber > 0 && hintNumber <= puzzleDigit)
                {
                    // It's a recognized hint for this puzzle.
                    pr = new PuzzleResponse("^P" + puzzleDigit + "H" + hintNumber, PuzzleResponse.ResponseType.Incorrect, "Right track!");
                }
            }
            if (pr == null)
            {
                bool notFound = (rand.Next(0, 2) == 0);
                PuzzleResponse.ResponseType rt = notFound ? PuzzleResponse.ResponseType.NotFound : PuzzleResponse.ResponseType.AskLater;
                pr = new PuzzleResponse(solutionAttempt, rt, notFound ? "Unfortunately not correct." : "Try again after some time.");
            }

            return pr;
        }

        private static String generateRandomTeamName(String teamId, int maxLength)
        {
            String name = "Team " + teamId;
            Debug.Assert(name.Length <= maxLength);
            return name;
        }
    }
}
