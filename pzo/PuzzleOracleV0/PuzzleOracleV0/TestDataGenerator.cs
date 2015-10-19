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
        const String TEST_ORACLE_DATA_FILENAME_ENCRYPTED1 = "test-puzzle-data-ENCRYPTED1.csv";
        const String TEST_ORACLE_DATA_FILENAME_FREETEXT1 = "test-puzzle-data-FREETEXT1.csv";
        const String TEST_ORACLE_DATA_FILENAME_ENCRYPTED2 = "test-puzzle-data-ENCRYPTED2.csv";
        const String TEST_ORACLE_DATA_FILENAME_FREETEXT2 = "test-puzzle-data-FREETEXT2.csv";
        const String TEST_TEAM_DATA_FILENAME = "test-team-data.csv";
        const String TEST_LOG_DATA_DIRNAME = "testLogs"; // for synthetic test logs (created with the -tldgen cmdline argument)
        const String TEST_PUZZLE_DATA_DIRNAME = "puzzleData";
        const String TEST_JSON_DATA_DIRNAME = "jsonData";
        const String TEST_PHASE_DIRNAME = "phase";
        const int NUMBER_OF_TEAMS = 1;
        const int NUMBER_OF_PUZZLES = 1;
        const int START_PUZZLE_NUMBER = 100;
        const int START_TEAM_NUMBER = 1;
        const int MAX_TEAM_NAME_LENGTH = 50;
        const int NUMBER_OF_PHASES = 5; // Number of times the oracle is stopped/started, (roughly) simulating thumb-drive swap-outs.

        public delegate String ToJson<T>(String indent, T item); // converts the item to JSon

        class TestPuzzleInfo
        {
            readonly public int puzzleNumber;
            readonly public String puzzleId;
            readonly public String puzzleName;
            readonly public int numberOfHints;

            // These are running stats that change as submissions are attempted.
            public int incorrectAttemptsLeft;
            public int solvesLeft;
            public int incorrectAttemptsMadeThisPhase;
            public bool solvedThisPhase;
            public int tempBlacklistsThisPhase;


            public TestPuzzleInfo(int puzzleNumber)
            {
                this.puzzleNumber = puzzleNumber;
                puzzleId = "" + puzzleNumber;
                Debug.Assert(puzzleId.Length == 3); // we expecte 3-digit numbers.
                puzzleName = "Puzzle " + puzzleId;
                numberOfHints = puzzleNumber % 10;

                incorrectAttemptsLeft = solvesLeft = incorrectAttemptsMadeThisPhase = 0;
                tempBlacklistsThisPhase = 0;
                solvedThisPhase = false;
            }

            public void registerNewPhase()
            {
                incorrectAttemptsMadeThisPhase = tempBlacklistsThisPhase = 0;
                solvedThisPhase = false;
            }


            internal static void registerNewPhase(TestPuzzleInfo[] puzzleInfo)
            {
                foreach (var tpi in puzzleInfo)
                {
                    tpi.registerNewPhase();
                }
            }
        };

        class TestTeamInfo
        {
            public int teamNumber;
            public String teamId;
            public String teamName;
            public TestTeamInfo(int number)
            {
                teamNumber = number;
                teamId = "T" + number;
                teamName = "Team " + teamId;
            }

        }

#if false // OBSOLETE
        /// <summary>
        /// This is for test purposes only - it generates test log data to the specified directory.
        /// These data files have NOTHING to do with this instance of puzzle oracle. Current team ID, puzzle-data etc are ignored.
        /// In fact, we create multiple instances of the oracle logger and write random submission logs to them!
        /// </summary>
        /// <param name="testLogDirName"></param>

        internal static void generateTestLogDataOld(String testDir)
        {
            Random rand = new Random();
            String testLogDir = testDir + "\\" + TEST_LOG_DATA_DIRNAME;

            try
            {
                // Create the test log dir if needed.
                if (!Directory.Exists(testLogDir))
                {
                    Trace.WriteLine(String.Format("Creating TEST LOG directory [{0}]", testLogDir));
                    Directory.CreateDirectory(testLogDir);
                }
                // We only generate test data if the directory is empty.
                var files = Directory.EnumerateFiles(testLogDir, "*.csv").ToArray();
                if (files.Length > 0)
                {
                    ErrorReport.logError(String.Format("Test log directory [{0}] is NOT empty. NOT generating any test logs. Please clean the directory and try again.", testLogDir));
                    return; //       ********** EARLY RETURN **************
                }

                for (int i = 0; i < NUMBER_OF_TEAMS; i++)
                {
                    int teamNumber = (i + START_TEAM_NUMBER);
                    TestTeamInfo tti = new TestTeamInfo(teamNumber);
                    OracleSubmissionLogger logger = new OracleSubmissionLogger(testLogDir, tti.teamId, tti.teamName);
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
#endif

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
                if (rand.Next(0, 2) == 0)
                {
                    attempt = "P" + puzzleId + "H" + rand.Next(1, 10); // hint. May not be there for this puzzle.
                }
                else
                {
                    attempt = "x"; // not found
                }
            }

            attempt += randomAnswerText(rand);

            return attempt;
        }

        private static string randomAnswerText(Random rand)
        {
            const int MAX_RANDOM_ADDON_TEXT = 10;
            int numChars = rand.Next(1, MAX_RANDOM_ADDON_TEXT + 1);
            return CryptoHelper.generateRandomSafeBase64string(rand.Next(), numChars);
            ;
        }

        private static PuzzleResponse generateRandomResponse(Random rand, string puzzleId, string solutionAttempt)
        {
            PuzzleResponse pr = null;
            String answer = "P" + puzzleId + "A";
            String hintRegex = "^P" + puzzleId + "H" + "[0-9]";

            solutionAttempt = PuzzleOracle.normalizeSolution(solutionAttempt);
            if (solutionAttempt.IndexOf(answer) == 0)
            {
                pr = new PuzzleResponse("^" + answer, PuzzleResponse.ResponseCode.Correct, "Correct!");
            }
            else if (Regex.IsMatch(solutionAttempt, hintRegex))
            {
                int puzzleDigit = puzzleId[2] - '0';
                Debug.Assert(puzzleDigit >= 0 && puzzleDigit <= 9);
                int hintNumber = solutionAttempt[5] - '0'; // The M in PNNNHM
                if (hintNumber > 0 && hintNumber <= puzzleDigit)
                {
                    // It's a recognized hint for this puzzle.
                    pr = new PuzzleResponse("^P" + puzzleDigit + "H" + hintNumber, PuzzleResponse.ResponseCode.Incorrect, "Right track!");
                }
            }
            if (pr == null)
            {
                bool notFound = (rand.Next(0, 2) == 0);
                PuzzleResponse.ResponseCode rt = notFound ? PuzzleResponse.ResponseCode.NotFound : PuzzleResponse.ResponseCode.AskLater;
                pr = new PuzzleResponse(solutionAttempt, rt, notFound ? "Unfortunately not correct." : "Try again after some time.");
            }

            return pr;
        }



        internal static void generateTestPuzzleData(string testDir)
        {
            Random rand = new Random();
            String testPDataDir = testDir + "\\" + TEST_PUZZLE_DATA_DIRNAME;
            String testJsonDataDir = testPDataDir + "\\" + TEST_JSON_DATA_DIRNAME;

            // Create the puzzle data dir if needed.
            if (!Directory.Exists(testPDataDir))
            {
                Trace.WriteLine(String.Format("Creating TEST PUZZLE DATA directory [{0}]", testPDataDir));
                Directory.CreateDirectory(testPDataDir);
            }

            // Create the JSON data dir if needed.
            if (!Directory.Exists(testJsonDataDir))
            {
                Trace.WriteLine(String.Format("Creating TEST PSDB JSON DATA directory [{0}]", testJsonDataDir));
                Directory.CreateDirectory(testJsonDataDir);
            }

            TestTeamInfo[] testTeamInfo = makeTestTeamInfo();
            TestPuzzleInfo[] testPuzzleInfo = makeTestPuzzleInfo(rand);

            // Synthesize team-info.csv
            synthesizeTeamInfo(testPDataDir, testTeamInfo);

            // Synthesize JSON files
            synthesizePsdbJsonInfo(testJsonDataDir, testTeamInfo, testPuzzleInfo);

            // Synthesize FREETEXT version of test puzzle-data
            synthesizeFreetextPuzzleData(testPDataDir, testPuzzleInfo);

            // Make secondary copiles - encrypted and freetext - of the puzzle-data by 
            // create instances of the puzzle oracle and asking it to save.
            generatePuzzleDataCopies(testPDataDir);
        }

        private static void generatePuzzleDataCopies(string testPDataDir)
        {
            string freetextPath1 = testPDataDir + "\\" + TEST_ORACLE_DATA_FILENAME_FREETEXT1;
            string freetextPath2 = testPDataDir + "\\" + TEST_ORACLE_DATA_FILENAME_FREETEXT2;
            string encryptedPath1 = testPDataDir + "\\" + TEST_ORACLE_DATA_FILENAME_ENCRYPTED1;
            string encryptedPath2 = testPDataDir + "\\" + TEST_ORACLE_DATA_FILENAME_ENCRYPTED2;
            // We will not progress if any of the above files already exist...
            if (File.Exists(freetextPath2) || File.Exists(encryptedPath1) || File.Exists(encryptedPath2))
            {
                ErrorReport.logError(String.Format("Test puzzle data directory [{0}] contains one or more of these files:\n\t{1},{2},{3},{4}\n"
                      + "NOT generating any data. Please delete these files and try again.",
                      testPDataDir,
                      TEST_ORACLE_DATA_FILENAME_FREETEXT1,
                      TEST_ORACLE_DATA_FILENAME_FREETEXT2,
                      TEST_ORACLE_DATA_FILENAME_ENCRYPTED1,
                      TEST_ORACLE_DATA_FILENAME_ENCRYPTED2
                      ));
                return;
            }


            SimpleSpreadsheetReader sr = CsvExcelReader.loadSpreadsheet(freetextPath1);
            PuzzleOracle oracle = new PuzzleOracle(sr);
            Debug.Assert(!oracle.isSourceEncrypted);
            String csvFilePath = oracle.writeCsvFile(testPDataDir, true); // true==encrypt
            File.Move(csvFilePath, encryptedPath1);
            Debug.Assert(!File.Exists(csvFilePath));

            sr = CsvExcelReader.loadSpreadsheet(encryptedPath1);
            oracle = new PuzzleOracle(sr);
            Debug.Assert(oracle.isSourceEncrypted);
            csvFilePath = oracle.writeCsvFile(testPDataDir, false); // false==don't encrypt
            File.Move(csvFilePath, freetextPath2);
            Debug.Assert(!File.Exists(csvFilePath));

            sr = CsvExcelReader.loadSpreadsheet(freetextPath2);
            oracle = new PuzzleOracle(sr);
            Debug.Assert(!oracle.isSourceEncrypted);
            csvFilePath = oracle.writeCsvFile(testPDataDir, true); // true == encrypt
            File.Move(csvFilePath, encryptedPath2);
            Debug.Assert(!File.Exists(csvFilePath));
        }


        private static TestTeamInfo[] makeTestTeamInfo()
        {
            TestTeamInfo[] teams = new TestTeamInfo[NUMBER_OF_TEAMS];
            for (int i = 0; i < teams.Length; i++)
            {
                int teamNumber = i + START_TEAM_NUMBER;
                teams[i] = new TestTeamInfo(teamNumber);
            }
            return teams;
        }


        private static TestPuzzleInfo[] makeTestPuzzleInfo(Random rand, TestTeamInfo tti = null)
        {
            const int MIN_INCORRECT_ATTEMPTS_PER_PUZZLE = 0;  // May get exceeded by 1 because of blacklisting.
            const int MAX_INCORRECT_ATTEMPTS_PER_PUZZLE = 10; // May get exceeded by 1 because of blacklisting..
            const int MAX_SOLVES_PER_PUZZLE = 3; // Per team

            TestPuzzleInfo[] puzzles = new TestPuzzleInfo[NUMBER_OF_PUZZLES];
            for (int i = 0; i < puzzles.Length; i++)
            {
                int puzzleNumber = i + START_PUZZLE_NUMBER;
                int puzzleNumberMod100 = puzzleNumber % 100;
                TestPuzzleInfo tpi = new TestPuzzleInfo(puzzleNumber);
                if (tti != null)
                {
                    bool solve = puzzleNumberMod100 % tti.teamNumber == 0;
                    if (solve)
                    {
                        tpi.solvesLeft = rand.Next(1, MAX_SOLVES_PER_PUZZLE + 1);
                    }
                    tpi.incorrectAttemptsLeft = rand.Next(MIN_INCORRECT_ATTEMPTS_PER_PUZZLE, MAX_INCORRECT_ATTEMPTS_PER_PUZZLE);
                }
                puzzles[i] = tpi;
            }
            return puzzles;
        }


        private static void synthesizeTeamInfo(string testPDataDir, TestTeamInfo[] testTeamInfo)
        {
            String teamInfoPath = testPDataDir + "\\" + TEST_TEAM_DATA_FILENAME;
            if (File.Exists(teamInfoPath))
            {
                Trace.WriteLine(String.Format("Overriting existing team info file [{0}]", teamInfoPath));
            }
            using (TextWriter tr = new StreamWriter(teamInfoPath, false)) // false == overwrite
            {
                tr.WriteLine("PTD,Version:1.0");
                tr.WriteLine("Id,Name");
                foreach (var tti in testTeamInfo)
                {
                    tr.WriteLine(String.Format("{0},{1}", tti.teamId, tti.teamName));
                }
                tr.Flush();
            }

        }

        private static void synthesizePsdbJsonInfo(string testJsonDataDir, TestTeamInfo[] testTeamInfo, TestPuzzleInfo[] testPuzzleInfo)
        {
            const string TEAMS_FILENAME = "teams.json";
            const string PUZZLES_FILENAME = "puzzles.json";
            String teamsPath = testJsonDataDir + "\\" + TEAMS_FILENAME;
            String puzzlesPath = testJsonDataDir + "\\" + PUZZLES_FILENAME;
            if (File.Exists(teamsPath))
            {
                Trace.WriteLine(String.Format("Overriting existing teams JSON file [{0}]", teamsPath));
            }
            if (File.Exists(puzzlesPath))
            {
                Trace.WriteLine(String.Format("Overriting existing puzzles JSON file [{0}]", puzzlesPath));
            }

            // Write out teams
            String puzzleIdsInJson = jsonPuzzleIdArray(testPuzzleInfo, "    ");
            using (TextWriter tr = new StreamWriter(teamsPath, false)) // false == overwrite
            {
                String ret = "";
                ret = toJson<TestTeamInfo>(testTeamInfo, "", true, (indent, tti) =>
                {
                    String i2 = indent + "  ";
                    return "{\n"
                        + String.Format("{0}: {1},\n{2}: {3},\n{4}: {5},\n{6}: {7},\n{8}: {9},\n{10}: {11}\n",
                        i2 + qt("name"), qt(tti.teamName),
                        i2 + qt("_id"), qt(tti.teamId),
                        i2 + qt("description"), qt("Synthetic team " + tti.teamNumber + " generated on " + DateTime.Now.ToShortDateString()),
                        i2 + qt("playerIds"), "[]",
                        i2 + qt("puzzleIds"), puzzleIdsInJson,
                        // NOT TEAM LEAD qt("teamLeadId"), ""
                        i2 + qt("active"), qt("true")
                        )
                        + indent + "}";
                });
                ret += "\n";
                tr.Write(ret);
                tr.Flush();
            }

            // Write out puzzles.json
            using (TextWriter tr = new StreamWriter(puzzlesPath, false)) // false == overwrite
            {
                String ret = "";
                ret = toJson<TestPuzzleInfo>(testPuzzleInfo, "", true, (indent, tpi) =>
                {
                    String i2 = indent + "  ";
                    return "{\n"
                        + String.Format("{0}: {1},\n{2}: {3},\n{4}: {5},\n{6}: {7}\n",
                        i2 + qt("name"), qt(tpi.puzzleName),
                        i2 + qt("_id"), qt(tpi.puzzleId),
                        i2 + qt("description"), qt("Synthetic puzzle " + tpi.puzzleNumber + " generated on " + DateTime.Now.ToShortDateString()),
                        i2 + qt("active"), qt("true")
                        )
                        + indent + "}";
                });
                ret += "\n";
                tr.Write(ret);
                tr.Flush();
            }
        }

        private static string jsonPuzzleIdArray(TestPuzzleInfo[] testPuzzleInfo, String indent)
        {
            return toJson<TestPuzzleInfo>(testPuzzleInfo, indent, false, (i2, tpi) =>
                {
                    return qt(tpi.puzzleId);
                });
        }

        private static string qt(string p)
        {
            return "\"" + p + "\"";
        }

        private static void synthesizeFreetextPuzzleData(string testPDataDir, TestPuzzleInfo[] testPuzzleInfo)
        {
            // Write out free-text version...
            String puzzleInfoPath = testPDataDir + "\\" + TEST_ORACLE_DATA_FILENAME_FREETEXT1;
            if (File.Exists(puzzleInfoPath))
            {
                Trace.WriteLine(String.Format("Overriting existing puzzle oracle data file [{0}]", puzzleInfoPath));
            }
            using (TextWriter tw = new StreamWriter(puzzleInfoPath, false)) // false == overwrite
            {
                // Write header properties
                tw.Write("POD,version:1.0,puzzlecount:" + testPuzzleInfo.Length);
                int maxHints = 9;
                int maxCols = maxHints + 3; // 3 for ID, Answer and Name
                int nProps = 3; // number of properties above.
                Utils.writeCsvCommas(tw, maxCols - nProps);
                tw.WriteLine("");

                // Write Table headers
                tw.Write("Id,Name,Answer");
                for (int i = 0; i < maxHints; i++)
                {
                    tw.Write(",Hint" + (i + 1));
                }
                int colsWritten = maxHints + 3; // 3 for ID, Name and Answer
                if (colsWritten < maxCols)
                {
                    Utils.writeCsvCommas(tw, maxCols - colsWritten);
                }
                tw.WriteLine("");

                // Write Puzzle rows
                foreach (TestPuzzleInfo tpi in testPuzzleInfo)
                {
                    // Write ID and Name 
                    tw.Write(tpi.puzzleId);
                    Utils.appendCsvCell(tw, tpi.puzzleName);

                    // Write answer. Note the ".*" so that anything can follow the intiial PnA
                    String answer = String.Format("P{0}A.*:_C You have solved puzzle {0}.", tpi.puzzleId);
                    Utils.appendCsvCell(tw, answer);

                    // Write hints..
                    for (int i = 0; i < tpi.numberOfHints; i++)
                    {
                        // Note the ".*" so that anything can follow the intiial PnHm
                        String hint = String.Format("P{0}H{1}.*:_KG You have matched hint {1} of puzzle {0}.", tpi.puzzleId, (i + 1));
                        Utils.appendCsvCell(tw, hint);
                    }

                    // Write remaining commas
                    colsWritten = 3 + tpi.numberOfHints; // 3 for ID, Name and Answer
                    if (colsWritten < maxCols)
                    {
                        Utils.writeCsvCommas(tw, maxCols - colsWritten);
                    }
                    tw.WriteLine("");
                }
                tw.Flush();
                tw.Close();
            }

        }

        private static String toJson<T>(T[] array, String indent, Boolean multiLine, ToJson<T> toJson)
        {
            String ret = "";
            String i2 = indent + "  ";
            String NL1 = multiLine ? "\n" + indent : "";
            String NL2 = multiLine ? "\n" + i2 : " ";
            if (array.Length == 0)
            {
                ret = "[]";
            }
            else if (array.Length == 1)
            {
                ret = "[" + toJson(i2, array[0]) + indent + "]";
            }
            else
            {
                ret = "[" + NL2;
                bool split = !multiLine && array.Length > 10;
                for (int i = 0; i < array.Length; i++)
                {
                    if (i > 0)
                    {
                        ret += "," + NL2;
                    }
                    if (split && i % 10 == 0) // break line regardless..
                    {
                        ret += "\n" + i2;
                    }
                    ret += toJson(i2, array[i]);

                }
                if (split)
                {
                    ret += "\n" + indent;
                }
                ret += NL1 + "]";
            }
            return ret;
        }

        /// <summary>
        /// VERSION2 - that actuall calls the Oracle. This is for test purposes only - it generates test log data to the specified directory.
        /// These data files have NOTHING to do with this instance of puzzle oracle. Current team ID, puzzle-data etc are ignored.
        /// In fact, we create multiple instances of the oracle logger and write random submission logs to them!
        /// </summary>
        /// <param name="testLogDirName"></param>
        internal static void generateTestLogData(String testDir)
        {
            Random rand = new Random();
            String testLogDir = testDir + "\\" + TEST_LOG_DATA_DIRNAME;
            String oracleDataPath = testDir + "\\" + TEST_PUZZLE_DATA_DIRNAME + "\\" + TEST_ORACLE_DATA_FILENAME_ENCRYPTED2;

            try
            {
                // Create the test log dir if needed.
                if (!Directory.Exists(testLogDir))
                {
                    Trace.WriteLine(String.Format("Creating TEST LOG directory [{0}]", testLogDir));
                    Directory.CreateDirectory(testLogDir);
                }
                // We only generate test data if the directory (and its subdirectories) is/are empty.
                var files = Directory.EnumerateFiles(testLogDir, "*.csv", SearchOption.AllDirectories).ToArray();
                if (files.Length > 0)
                {
                    ErrorReport.logError(String.Format("Test log directory [{0}] is NOT empty. NOT generating any test logs. Please clean the directory and try again.", testLogDir));
                    return; //       ********** EARLY RETURN **************
                }

                TestTeamInfo[] testTeams = makeTestTeamInfo();
                foreach (var tti in testTeams)
                {
                    TestPuzzleInfo[] testPuzzles = makeTestPuzzleInfo(rand, tti);
                    List<TestPuzzleInfo> puzzlesToUnsuccessfullyAttempt = new List<TestPuzzleInfo>();
                    List<TestPuzzleInfo> puzzlesToSolve = new List<TestPuzzleInfo>();

                    foreach (var ttp in testPuzzles)
                    {
                        if (ttp.incorrectAttemptsLeft > 0)
                        {
                            puzzlesToUnsuccessfullyAttempt.Add(ttp);
                        }
                        if (ttp.solvesLeft > 0)
                        {
                            puzzlesToSolve.Add(ttp);
                        }
                    }

                    for (int j = 0; j < NUMBER_OF_PHASES; j++)
                    {
                        TestPuzzleInfo.registerNewPhase(testPuzzles);
                        generateLogDataForTeam(rand, oracleDataPath, testLogDir, j, tti, puzzlesToUnsuccessfullyAttempt, puzzlesToSolve);
                    }
                    verifyPostRunStats(testPuzzles);
                }
            }
            catch (ApplicationException ex)
            {
                ErrorReport.logError("Internal error attempting to write test log data. Can't guarantee the data are correct.");
                Trace.TraceError(MODULE + "Exception attempting to generate test log data. Ex: " + ex);
            }
        }


        private static void verifyPostRunStats(TestPuzzleInfo[] puzzleInfo)
        {
            foreach (var tpi in puzzleInfo)
            {
                Debug.Assert(tpi.solvesLeft == 0);
                Debug.Assert(tpi.incorrectAttemptsLeft == 0);
            }
        }

        private static void generateLogDataForTeam(Random rand, String oracleDataPath, string testLogDir, int phaseNo,
            TestTeamInfo tti, List<TestPuzzleInfo> puzzlesToUnsuccessfullyAttempt, List<TestPuzzleInfo> puzzlesToSolve)
        {
            String phaseDir = testLogDir + "\\" + TEST_PHASE_DIRNAME + (phaseNo + 1); // Phase dir is 1-based, not 0-based.

            // Create the phase dir if needed.
            if (!Directory.Exists(phaseDir))
            {
                Trace.WriteLine(String.Format("Creating TEST LOG directory [{0}]", phaseDir));
                Directory.CreateDirectory(phaseDir);
            }

            // Compute number of puzzles to attempt in this phase. 
            int phasesLeft = NUMBER_OF_PHASES - phaseNo; // including this one.
            Debug.Assert(phasesLeft > 0);
            int totalUnsuccessfulAttemptsLeft = puzzlesToUnsuccessfullyAttempt.Sum(tpi => tpi.incorrectAttemptsLeft);
            int totalSolvesLeft = puzzlesToSolve.Sum(tpi => tpi.solvesLeft);
            int unsuccessfulAttemptsLeft = Utils.pickRandomPortion(rand, totalUnsuccessfulAttemptsLeft, phasesLeft);;
            int solvesLeft = Utils.pickRandomPortion(rand, totalSolvesLeft, phasesLeft);

     

            // Create Oracle and submssion logger for this phase.
            PuzzleOracle oracle = null;
            using (OracleSubmissionLogger logger = new OracleSubmissionLogger(phaseDir, tti.teamId, tti.teamName))
            {
                SimpleSpreadsheetReader sr = CsvExcelReader.loadSpreadsheet(oracleDataPath);
                oracle = new PuzzleOracle(sr);

                while (unsuccessfulAttemptsLeft > 0)
                {
                    // We decide whether to solve or unsuccessfully attempt this time around, with probability that depends
                    // on the fractional amount of solves left.
                    bool solve = rand.NextDouble() < solvesLeft / (double)(solvesLeft + unsuccessfulAttemptsLeft);
                    Debug.Assert(!solve || puzzlesToSolve.Count > 0); // solve==true implies we have puzzles to solve!
                    Debug.Assert(solve || puzzlesToUnsuccessfullyAttempt.Count > 0); // solve==false implies we have unsuccessful puzzles to solve!

                    // Pick a random puzzle to work with...
                    TestPuzzleInfo tpi = Utils.selectRandomElemement<TestPuzzleInfo>(rand, solve ? puzzlesToSolve : puzzlesToUnsuccessfullyAttempt);

                    String solutionAttempt = generateRandomSolutionAttempt(rand, tpi.puzzleId, solve); // true == must solve.
                    PuzzleResponse pr = oracle.checkSolution(tpi.puzzleId, solutionAttempt);
                    verifyOracleResponse(tti, tpi, solve, solutionAttempt, pr);
                    logger.logSolveAttempt(tpi.puzzleId, solutionAttempt, pr);
                    bool blacklisted = pr.code == PuzzleResponse.ResponseCode.AskLater;
                    bool permanentlyBlacklisted = pr.code == PuzzleResponse.ResponseCode.AskNever;

                    if (blacklisted)
                    {
                        const int MAX_TEMP_BLACKLISTS = 3;
                        // Team has been blacklisted for this puzzle!
                        tpi.tempBlacklistsThisPhase++;
                        int max = rand.Next(1, MAX_TEMP_BLACKLISTS + 1);
                        if (tpi.tempBlacklistsThisPhase >= max)
                        {
                            // Reset the blacklist (we have to simulate this as we aren't waiting the required time.
                            oracle.clearTemporaryBlacklist(tpi.puzzleId);
                            logger.logInfo("TLDGEN: CLEARING TEMPORARY BLACKLISTING for puzzle " + tpi.puzzleId);
                            tpi.tempBlacklistsThisPhase = 0;
                        }
                    }


                    if (pr.code == PuzzleResponse.ResponseCode.Correct)
                    {
                        Debug.Assert(solve);
                        Debug.Assert(solvesLeft > 0);
                        solvesLeft--;
                        Debug.Assert(tpi.solvesLeft > 0);
                        tpi.solvesLeft--;
                        if (tpi.solvesLeft == 0)
                        {
                            puzzlesToSolve.Remove(tpi); // If it's been solved tpi had better be in the puzzles to solve list!
                        }
                    }
                    else
                    {
                        // We didn't solve the puzzle. We could get here even if solve==true because of blacklisting.
                        if (solve)
                        {
                            // Must be blacklist
                            Debug.Assert(blacklisted || permanentlyBlacklisted);
                            Trace.WriteLine(String.Format("Team {0} attempt to solve puzzle {1} failed because of blacklisting.", tti.teamNumber, tpi.puzzleNumber));

                            // If we are in the last phase and this is a PERMANENT blacklist, we override that so that we can be sure to
                            // solve this puzzle next time through!
                            if (phasesLeft == 1 && permanentlyBlacklisted)
                            {
                                oracle.clearPermanentBlacklist(tpi.puzzleId);
                                logger.logInfo("TLDGEN: CLEARING PERMANENT BLACKLISTING for puzzle " + tpi.puzzleId);
                                tpi.tempBlacklistsThisPhase = 0;
                            }
                        }
                        else
                        {
                            Debug.Assert(unsuccessfulAttemptsLeft > 0);
                            unsuccessfulAttemptsLeft--;
                            Debug.Assert(tpi.incorrectAttemptsLeft > 0);
                            tpi.incorrectAttemptsLeft--;
                            if (tpi.incorrectAttemptsLeft == 0)
                            {
                                puzzlesToUnsuccessfullyAttempt.Remove(tpi);
                            }
                        }
                    }
                }
            }

        }



        private static void verifyOracleResponse(TestTeamInfo tti, TestPuzzleInfo tpi, bool mustSolve, string solutionAttempt, PuzzleResponse pr)
        {
            String hintRegex = "^P" + tpi.puzzleId + "H" + "[0-9]";
            PuzzleResponse.ResponseCode expectedResponse = PuzzleResponse.ResponseCode.NotFound;

            solutionAttempt = PuzzleOracle.normalizeSolution(solutionAttempt);

            if (solutionAttempt.IndexOf("P" + tpi.puzzleId + "A") == 0)
            {
                expectedResponse = PuzzleResponse.ResponseCode.Correct;
            }
            else if (Regex.IsMatch(solutionAttempt, hintRegex))
            {
                int puzzleDigit = tpi.puzzleNumber % 10;
                int hintNumber = solutionAttempt[5] - '0'; // The M in PNNNHM
                if (hintNumber > 0 && hintNumber <= puzzleDigit)
                {
                    // We expect to match this hint for this puzzle.
                    expectedResponse = PuzzleResponse.ResponseCode.Incorrect;
                }
            }

            // Now let's check against actual response.
            if (pr.code == PuzzleResponse.ResponseCode.AskNever)
            {
                // permanent blacklisting.
                Debug.Assert(tpi.incorrectAttemptsMadeThisPhase > Blacklister.MAX_TOTAL_ATTEMPTS);
            }
            else if (pr.code == PuzzleResponse.ResponseCode.AskLater)
            {
                // temporary blacklisting.
                Debug.Assert(tpi.incorrectAttemptsMadeThisPhase > Blacklister.MAX_ATTEMPTS_PER_SESSION);
            }
            else
            {
                Debug.Assert(expectedResponse == pr.code);
                Debug.Assert((mustSolve && pr.code == PuzzleResponse.ResponseCode.Correct)
                    || (!mustSolve && pr.code != PuzzleResponse.ResponseCode.Correct));
            }
        }
    }
}
