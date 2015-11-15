//
// MODULE: Puzzle Oracle - for A Puzzle Oracle for Puzzle Events
// File: PuzzleOracle.cs
//
// HISTORY
//   September 2015 Joseph M. Joy Created

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.IO;

namespace PuzzleOracleV0
{
    class PuzzleOracle
    {
        const string MODULE = "PO: "; // for debug tracing.
        const String ORACLE_PASSWORD = "benny"; // data files are encrypted with this password
        const String ORACLE_ENCRYPT_CHARS = ".,:;?!_- 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const String SPREADSHEET_LABEL_ID = "ID"; // ID field of spreadsheet
        const String NORMALIZAITION_STRIP_CHARS = @"(\s+)|([.,:;!""'?-])"; // ignored in user solutions


        // Various user-visible strings
        const String GENERIC_INCORRECT_RESPONSE = "Unfortunately, your answer is incorrect.";
        const String INCORRECT_BUT_PUZZLE_ANSWERED_BEFORE = "Your answer is incorrect, however someone else in your team has already answered this puzzle. ";
        const String BLACKLISTED_RESPONSE = "Your team has already made many submission attempts for this puzzle.\n Please wait {0} before submitting"
            + " an answer to puzzle {1}"; // Note FORMAT placeholders (two) - duration and puzzle ID.
        const String PERMANENT_BLACKLISTED_RESPONSE = "Your team has exceeded the number of allowed submissions for this puzzle.\n Please contact an instructor.";





        Dictionary<String, PuzzleInfo> puzzles;
        Dictionary<String, String> properties;
        List<String> puzzleIDs; // For diagnostic purposes. In order that they were read in from the file.
        Random rand = new Random();

        // If present in the responses (after the ':') they are expanded into their corresponding long-form text.
        readonly String[,] responseAliases = {
{"_C", "Correct!"},
{"_KG", "Keep going. You're on the right track."},
{"_NQ", "Not Quite."},
{"_CNQ", "Close, but not quite."},
{"_WT", "You're on the wrong track."},
{"_RTIC", "Read the puzzle instructions carefully."}
                                  };



        public PuzzleOracle(SimpleSpreadsheetReader sr)
        {
            puzzles = new Dictionary<string, PuzzleInfo>();
            properties = new Dictionary<string, string>();
            puzzleIDs = new List<string>();
            addPuzzles(sr);
        }

        /// <summary>
        /// Attempts to lookup a puzzle name by ID. Returns null if not found.
        /// </summary>
        public string tryGetName(string puzzleId)
        {
            //if (puzzleId == "007") return "Golden Eye";
            PuzzleInfo pi;
            if (puzzles.TryGetValue(puzzleId, out pi))
            {
                return pi.puzzleName;
            }
            return null;
        }


        /// <summary>
        /// This is used for debugging purposes - be sure NOT to write out the decrypted
        /// data file in the production version of the app! The directory is the same as where the
        /// data file was loaded, and the name is hardcoded.
        /// </summary>
        /// <param name="encrypted"></param>
        /// <returns>the full path of the file that was created.</returns>
        public String writeCsvFile(String basePath, Boolean encrypted)
        {
            const string ENCRYPTED_PROPERTY = "encrypted";
            String fileName = "data-out-FREETEXT.csv";
            if (encrypted)
            {
                fileName = "data-out-ENCRYPTED.csv";
            }
            else
            {
                Trace.WriteLine("WARNING: Writing UNENCRYPTED data to file!");
            }
            String pathName = basePath + @"\" + fileName;
            using (TextWriter tw = new StreamWriter(pathName))
            {
                // Write header properties
                tw.Write("POD,version:1.0");
                foreach (KeyValuePair<String, String> kvp in properties)
                {
                    String k = kvp.Key;
                    if (!k.Equals("version") && !k.Equals("pod"))
                    {
                        if (!k.Equals(ENCRYPTED_PROPERTY)) // we selectively add it later
                        {
                            String s = (kvp.Value.Length == 0) ? "" : ":" + kvp.Value;
                            Utils.appendCsvCell(tw, k + s);
                        }
                    }
                }
                int nProps = properties.Count;

                // Add the "encrypted" property if we need to...
                if (encrypted)
                {
                    Utils.appendCsvCell(tw, ENCRYPTED_PROPERTY);
                    nProps++;
                }

                int maxHints = computeMaxHints();
                int maxCols = maxHints + 3; // 3 for ID, Answer and Name
                if (maxCols < nProps)
                {
                    maxCols = nProps;
                }
                else
                {
                    Utils.writeCsvCommas(tw, maxCols - nProps);
                }
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
                foreach (String id in puzzleIDs)
                {
                    PuzzleInfo pi = puzzles[id];

                    // Write ID and Name
                    tw.Write(id);
                    Utils.appendCsvCell(tw, pi.puzzleName);

                    // Write responses... (Answer comes first
                    foreach (var pr in pi.responses)
                    {
                        String s = pr.pattern + (pr.response.Length == 0 ? "" : ":" + compressAliases(pr.response));
                        if (encrypted)
                        {
                            s = "[" + endecrypt(id, s, true) + "]"; // true == encrypt
                        }
                        Utils.appendCsvCell(tw, s);
                    }
                    colsWritten = 2 + pi.responses.Count; // 2 for ID and Name
                    if (colsWritten < maxCols)
                    {
                        Utils.writeCsvCommas(tw, maxCols - colsWritten);
                    }
                    tw.WriteLine("");
                }
                tw.Flush();
                tw.Close();
            }
            return pathName;
        }



        // Go through list of puzzles and compute the max number of hints addded to any particular puzzle.
        // Used to write out the CSV file with enough commas.
        private int computeMaxHints()
        {
            int max = 0;
            foreach (var kpr in puzzles)
            {
                PuzzleInfo pi = kpr.Value;
                int n = pi.responses.Count;
                if (n > max)
                {
                    max = n;
                }
            }
            return max;
        }

        /// <summary>
        /// Constructs a response for the user-generated solution. puzzleId
        /// MUST reference a valid puzzle else a KeyNotFound exception is 
        /// thrown (call tryGetName first if not sure).
        /// </summary>
        /// <param name="puzzleId"></param>
        /// <param name="solution"></param>
        /// <returns></returns>
        public PuzzleResponse checkSolution(string puzzleId, string solution)
        {
            // Lookup puzzle...
            solution = normalizeSolution(solution);
            PuzzleInfo pi = puzzles[puzzleId];
            PuzzleResponse pr = null;

            // Check blacklist state (<0 means we're ok)
            int delay = pi.blacklister.submitDelay;

            // Have we solved this before?
            Boolean alreadySolved = pi.puzzleSolved;


            // If we are not already solved, and we are blacklisted, we return a special "try later" message.
            if (!alreadySolved && delay > 0)
            {
                String sResponse;

                // Blacklisted! 
                Boolean permanentlyBlacklisted = delay == Blacklister.BLACKLIST_FOREVER_TIME;
                if (permanentlyBlacklisted)
                {
                    sResponse = PERMANENT_BLACKLISTED_RESPONSE;
                }
                else
                {
                    String sDelay = delay + " seconds";
                    if (delay > 60)
                    {
                        int minutes = delay / 60;
                        int seconds = delay % 60;
                        sDelay = minutes + " minute" + ((minutes == 1) ? "" : "s");
                        if (seconds > 0)
                        {
                            sDelay += " and " + seconds + " seconds";
                        }
                    }
                    sResponse = String.Format(BLACKLISTED_RESPONSE, sDelay, pi.puzzleId);
                }
                pr = new PuzzleResponse(solution, PuzzleResponse.ResponseCode.AskLater, sResponse);
                return pr; // ***************** EARLY RETURN *******************
            }

            pr = pi.matchResponse(solution);
            if (pr == null)
            {
                pr = new PuzzleResponse(solution, PuzzleResponse.ResponseCode.NotFound, GENERIC_INCORRECT_RESPONSE);
            }

            pi.blacklister.registerSubmission();

            // If already solved, but solution is not correct, we put a special message.
            if (!alreadySolved)
            {
                pi.puzzleSolved = (pr.code == PuzzleResponse.ResponseCode.Correct);

            }
            else if (pr.code != PuzzleResponse.ResponseCode.Correct)
            {
                // Puzzle has been solved before but there is a new, incorrect submission. We give a helpful message to the user.
                pr = new PuzzleResponse(solution, pr.code, INCORRECT_BUT_PUZZLE_ANSWERED_BEFORE);
            }

            return pr;
        }

        public String lookupProperty(String key)
        {
            String value = null;
            properties.TryGetValue(key.ToUpperInvariant(), out value);
            return value;
        }

        /// <summary>
        /// Upper-cases and strips extraneous characters from the user solution.
        /// </summary>
        public static string normalizeSolution(string solution)
        {
            String s = Regex.Replace(solution, NORMALIZAITION_STRIP_CHARS, "");
            s = s.ToUpperInvariant();
            //Trace.WriteLine(String.Format("Normalizing solution [{0}] into [{1}]", solution, s));
            return s;
        }

        /// <summary>
        /// Adds all puzzles in the specified spreadsheet. Individual puzzles may not
        /// be added for a variety of reasons including:
        ///     - Duplicate Puzzle ID (only first one gets added)
        ///     - Empty answer field.
        ///     - Invalid REGEX field in answer or hints.
        /// Errors are reported as Trace output.
        /// TODO: Have a systematic way to report skipped puzzles.
        /// </summary>
        /// <param name="sr"></param>
        private void addPuzzles(SimpleSpreadsheetReader sr)
        {
            // We expect that the first row contains the signature ("POD") followed by "version:1.0" followed by 
            // additional properties (which we ignore for now)
            const int HEADER_ROWS = 2;
            const int MIN_COLS = 3;
            const String FILE_SIGNATURE = "POD";
            const String PROP_ENCRYPTED = "encrypted";
            int sheet = 0;
            bool encrypted = false; // whether answers and hints are encrypted or not.
            int numRows = sr.getNumRows(sheet);
            int numCols = sr.getNumCols(sheet);
            if (numRows < HEADER_ROWS || numCols < MIN_COLS)
            {
                ErrorReport.logError("Puzzle data spreadsheet is too small!");
                throw new ArgumentException();
            }
            String[] propertyRow = sr.getRowCells(0, 0, numCols - 1, sheet);
            String[] header = sr.getRowCells(1, 0, numCols - 1, sheet);

            // We expect the first property cell to be POD (all caps)
            if (!Utils.stripEndBlanks(propertyRow[0]).Equals(FILE_SIGNATURE))
            {
                ErrorReport.logError("Puzzle data spreadsheet has an invalid/missing signature.");
                throw new ArgumentException();
            }

            // Read rest of properties
            readProperties(propertyRow);

            // Check if answer keys are encrypted.
            if (properties.ContainsKey(PROP_ENCRYPTED))
            {
                encrypted = true;
            }
            this.sourceIsEncrypted = encrypted;

            // We expect the first header cell to be "id"
            String headerId = Utils.stripEndBlanks(header[0]);
            if (!headerId.Equals(SPREADSHEET_LABEL_ID, StringComparison.CurrentCultureIgnoreCase))
            {
                ErrorReport.logError("Puzzle data spreadsheet does not have the ID field.");
                throw new ArgumentException();
            }
            int startRow = HEADER_ROWS; // First row of puzzle data
            int startCol = 0; // First col of puzzle data 
            //int puzzleCount = numRows - HEADER_ROWS; // could be zero; it's valid to have 0 puzzles.
            for (int i = startRow; i < numRows; i++)
            {
                String[] sRow = sr.getRowCells(i, startCol, numCols - 1, sheet);
                const String REGEX_ID = @"^[0-9][0-9][0-9]$"; // For now, IDs must be 3-digit numbers.
                String id = Utils.stripBlanks(sRow[0]);
                if (!Regex.IsMatch(id, REGEX_ID))
                {
                    String msg = String.Format("Skipped row {0}: invalid ID", i);
                    Trace.WriteLine(msg);
                    ErrorReport.logWarning(msg);
                    continue;
                }

                // We got the ID, if needed decrypt remaining fields after Name
                if (encrypted)
                {
                    decryptCells(id, sRow, 2, numCols - 1); // 2 == skip Id and Name. False == descrypt
                }

                //  Now let's get the remaining columns. First,  get the first two: Name and Answer.

                String name = Utils.stripEndBlanks(sRow[1]);
                String answer = Utils.stripEndBlanks(sRow[2]);
                // Neither should be blank.
                if (name.Equals("") || answer.Equals(""))
                {
                    String msg = String.Format("Skipped row {0}: blank Name or Answer", i);
                    ErrorReport.logWarning(msg);
                    Trace.WriteLine(msg);
                    continue;
                }

                PuzzleResponse pAnswerResponse = buildPuzzleResponse(answer, PuzzleResponse.ResponseCode.Correct);
                if (pAnswerResponse == null)
                {
                    String msg = String.Format("Skipped row {0}: Invalid Answer", i);
                    ErrorReport.logWarning(msg);
                    Trace.WriteLine(msg);
                    continue;
                }
                PuzzleInfo pi = new PuzzleInfo(id, name);
                pi.addResponse(pAnswerResponse);

                // Add hints, if any...
                for (int j = 3; j < sRow.Length; j++)
                {
                    String field = Utils.stripEndBlanks(sRow[j]);
                    if (field.Length > 0)
                    {
                        PuzzleResponse pr = buildPuzzleResponse(field, PuzzleResponse.ResponseCode.Incorrect);
                        if (pr == null)
                        {
                            String msg = String.Format("Ignored hint {0} on row {1}: Invalid hint content", j, i);
                            Trace.WriteLine(msg);
                            ErrorReport.logWarning(msg);
                            continue;
                        }
                        pi.addResponse(pr);
                    }
                }

                try
                {

                    puzzles.Add(id, pi);
                    puzzleIDs.Add(id);
                    //Trace.WriteLine(String.Format("Adding row {0}: Puzzle ID {1}, Answer {2}", i, id, answer));

                }
                catch (ArgumentException)
                {
                    String msg = String.Format("Ignored row {0}: Duplicate ID {1}", i, id);
                    Trace.WriteLine(msg);
                    ErrorReport.logWarning(msg);
                }

            }

        }

        /// <summary>
        /// Decrypt the columns in the range (inclusive)
        /// </summary>
        /// <param name="sRow"></param>
        /// <param name="fromCol"></param>
        /// <param name="toCol"></param>
        private void decryptCells(String id, string[] sRow, int fromCol, int toCol)
        {
            for (int i = fromCol; i <= toCol && i < sRow.Length; i++)
            {
                String s = sRow[i];
                if (s.Length == 0)
                {
                    continue;
                }

                if (s.Length < 2 || s[0] != '[' || s[s.Length - 1] != ']')
                {
                    Trace.WriteLine(String.Format("Ignoring attempt to decrypt unencrypted cell {0}", s));
                    continue;
                }
                String t = endecrypt(id, s.Substring(1, s.Length - 2), false); // false == derypt
                sRow[i] = t;
            }
        }

        // Encrypts/decrypts given text using the oracle password, customized by the puzzle ID.
        private string endecrypt(string id, string text, bool encrypt)
        {
            if (encrypt)
            {
                // Add random chars to randomize text length.
                text = addRandomChars(text);
            }
            String eText = CryptoHelper.simpleEncryptDecrypt(ORACLE_PASSWORD, id, ORACLE_ENCRYPT_CHARS, text, encrypt);
            if (!encrypt)
            {
                // Remove previously added random chars to randomize text length.
                eText = removeRandomChars(eText);
            }
            return eText;
        }

        /// <summary>
        /// Add random chars to the beginning of the string - the first char is a digit (can be 0) that indicates how many
        /// characters follow.
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        private string addRandomChars(string text)
        {
            //ORACLE_ENCRYPT_CHARS
            int n = rand.Next(10);
            String prefix = "" + n; // n could be 0.
            for (int i = 0; i < n; i++)
            {
                prefix += ORACLE_ENCRYPT_CHARS[rand.Next(ORACLE_ENCRYPT_CHARS.Length)];
            }
            return prefix + text;
        }


        /// <summary>
        /// We expect the first char to be a digit. We remove that many following chars. 
        /// Various exceptions thrown if this is not the case.
        /// </summary>
        /// <param name="eText"></param>
        /// <returns></returns>
        private string removeRandomChars(string eText)
        {
            int n = eText[0] - '0'; // n could be 0, in which no random chars follow.
            if (n < 0 || n > 9)
            {
                throw new ArgumentException("Expecting first char to be a digit!");
            }
            return eText.Substring(n + 1); // better be enough chars.
        }


        /*
         * OBSOLETE
         * 
        private string permute(string s, Boolean encrypt)
        {
            String originalChars = ":,.-_;!|()[] 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Add  :,.-_;!0123456789 and space
            String permutedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:,.-_;!|()[] 0123456789";
            String p1 = originalChars;
            String p2 = permutedChars;
            Debug.Assert(p1.Length == p2.Length);
            if (!encrypt)
            {
                p1 = permutedChars;
                p2 = originalChars;
            }
            String t = "";
            foreach (char c in s)
            {
                char c2 = c;
                int i = p2.IndexOf(c);
                if (i != -1)
                {
                    c2 = p1[i];
                }
                t += c2;
            }

            return t;
        }
        */
        /// <summary>
        /// Parse and populate the properties. The format of string is name[:value]. If value is not
        /// present than the empty string (not null) is inserted. Duplicates are ignored (though they
        /// generate a trace)
        /// </summary>
        /// <param name="propertyRow"></param>
        private void readProperties(string[] propertyRow)
        {
            for (int i = 0; i < propertyRow.Length; i++)
            {
                String s = propertyRow[i];
                int colonIndex = s.IndexOf(":");
                String propName = s;
                String propValue = "";
                if (colonIndex != -1)
                {
                    propName = s.Substring(0, colonIndex);
                    propValue = s.Substring(colonIndex + 1);
                    propValue = Utils.stripEndBlanks(propValue);
                }
                propName = Utils.stripEndBlanks(propName);
                propName = propName.ToLowerInvariant();
                if (!Regex.IsMatch(propName, @"^[a-z_][0-9a-z_]*$"))
                {
                    if (propName.Length > 0)
                    {
                        Trace.WriteLine(String.Format("Invalid property {0}", propName));
                    }
                    continue;
                }

                if (properties.ContainsKey(propName))
                {
                    Trace.WriteLine(String.Format("Ignoring duplicate property {0}", propName));
                    continue;
                }

                // Add to property table
                properties.Add(propName, propValue);
            }
        }


        /// <summary>
        /// Expands the compactified string representation of a response into REGEX pattern and expanded
        /// responses - returned as a PuzzleResponse object. Returns null if there was a parse error (including
        /// invalid Regex pattern.)
        /// </summary>
        /// <param name="s"></param>
        /// <param name="responseType"></param>
        /// <returns></returns>
        private PuzzleResponse buildPuzzleResponse(string s, PuzzleResponse.ResponseCode responseType)
        // Format REGEX[:HINT]
        {
            String pattern = ""; // REGEX pattern that matches the user-supplied solution.
            String response = "";
            int i = s.IndexOf(":");
            if (i >= 0)
            {
                pattern = s.Substring(0, i);
                response = s.Substring(i + 1); // can be ""
            }
            else
            {
                pattern = s;
            }
            pattern = Utils.stripEndBlanks(pattern);
            response = Utils.stripEndBlanks(response);

            // Verify that the pattern is a valid Regex pattern!
            if (pattern.Length == 0)
            {
                Trace.WriteLine("Empty pattern - ignoring response.");
                return null;
            }

            // Expand any aliases in response.
            response = expandAliases(response);

            PuzzleResponse pr = new PuzzleResponse(pattern, responseType, response);

            // Check that the pattern is well formed...
            try
            {
                Regex.IsMatch("foo", pr.workingPattern);
            }
            catch (ArgumentException)
            {
                String msg = String.Format("Ignoring pattern: Invalid REGEX '{0}'", pattern);
                ErrorReport.logWarning(msg);
                Trace.WriteLine(msg);
                return null;
            }

            return pr;
        }

        /// <summary>
        /// Expands embedded aliases (such as _KG) in-place. The alias table is responseAliases.
        /// </summary>
        /// <param name="response"></param>
        /// <returns></returns>
        private string expandAliases(string response)
        {
            int numAliases = responseAliases.GetUpperBound(0) + 1;
            for (int i = 0; i < numAliases; i++)
            {
                String alias = responseAliases[i, 0];
                String expansion = responseAliases[i, 1];
                response = response.Replace(alias, expansion);
            }
            return response;
        }

        /// <summary>
        /// This is the inverse of expandAlias. It runs the patterns in inverse and in reverse order.
        /// </summary>
        /// <param name="response"></param>
        /// <returns></returns>
        private string compressAliases(string response)
        {
            int numAliases = responseAliases.GetUpperBound(0) + 1;
            for (int i = numAliases - 1; i >= 0; i--)
            {
                String alias = responseAliases[i, 0];
                String expansion = responseAliases[i, 1];
                response = response.Replace(expansion, alias);
            }
            return response;
        }


        private bool sourceIsEncrypted = false;
        public bool isSourceEncrypted { get { return sourceIsEncrypted; } }

        internal void clearTemporaryBlacklist(string puzzleId)
        {
            Trace.WriteLine(MODULE + "Clearing TEMPORARY blacklisting for puzzle " + puzzleId);
            PuzzleInfo pi = puzzles[puzzleId];
            pi.blacklister.clearTemporaryBlacklist();
        }

        internal void clearPermanentBlacklist(string puzzleId)
        {
            Trace.WriteLine(MODULE + "Clearing PERMANENT blacklisting for puzzle " + puzzleId);
            PuzzleInfo pi = puzzles[puzzleId];
            pi.blacklister.clearPermanentBlacklist();
        }
    }
}
