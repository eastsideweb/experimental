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
    class OracleSubmissionLogger : IDisposable
    {
        const String META_PUZZLE_ID = "0"; // for logging status messages
        const String LOG_PASSWORD = "moxie";
        const String LOG_ENCRYPT_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";// just alnum

        TextWriter tw = null;
        readonly String teamId;
        readonly String teamName;
        readonly String transactionIdBase;
        int transactionCount = 0;
        Boolean fatalError = false; // if true - don't log!

        //public static TextWriter generateNewLogger

        public OracleSubmissionLogger(String logDir, String teamId, String teamName)
        {
            if (!Regex.IsMatch(teamId, "^T[0-9]+$"))
            {
                ErrorReport.logError("Team ID \"" + teamId + "\" is malformed - should be T followed by all digits");
                throw new ApplicationException();
            }
            teamName = Regex.Replace(teamName, "[\"',\\n\\r]", "");  // remove some troublesome characters if they happen to be there.
            this.teamId = teamId;
            this.teamName = teamName;

            // We seed the transaction ID with as much independent sources of bits we can get our hands on...
            int seed = Environment.MachineName.GetHashCode() + teamId.GetHashCode() + (int)DateTime.Now.Ticks;
            this.transactionIdBase = CryptoHelper.generateRandomSafeBase64string(seed, 6);
            tw = newLogStream(logDir, teamId, transactionIdBase);

            this.logMetaStatus("LOG_STARTED");

        }


        private static TextWriter newLogStream(string logDir, string teamId, string transactonBase)
        {
            // Log file format: T6-JOSEPHJ-HP-1666 .csv
            String path = logDir + "\\" + teamId + "-" + Environment.MachineName + "-" + transactonBase + ".csv";
            try
            {
                TextWriter tr = new StreamWriter(path, true); // true == append
                return tr;
            }
            catch (System.IO.DirectoryNotFoundException e)
            {
                ErrorReport.logError(String.Format("Could not find path of the submission log file path [{0}]. Cannot continue.", path));
                throw new ApplicationException("Submission log file path invalid", e);
                throw e;
            }

        }

        private void logMetaStatus(String status)
        {
            //extraText = extraText.Replace(",", ""); // Get rid of commas which can confuse the CSV format...
            //logSolveAttempt(META_PUZZLE_ID, status, new PuzzleResponse("", PuzzleResponse.ResponseType.Correct, extraText));
            rawLog(META_PUZZLE_ID, status, "On " + Environment.MachineName + " at " + Utils.getUTCTimeCode());
        }

        public void logSolveAttempt(String puzzleId, String attemptedSolution, PuzzleResponse response)
        {
            // We log the normalized attempt so that it doesn't have extraneous characters.
            attemptedSolution = PuzzleOracle.normalizeSolution(attemptedSolution);

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

            // Encrypt...
            String customizer = teamId + puzzleId; // Important - this is the customizer format used for encryption.
            responseCode = CryptoHelper.simpleEncryptDecrypt(LOG_PASSWORD, customizer, LOG_ENCRYPT_CHARS, responseCode, true);
            attemptedSolution = CryptoHelper.simpleEncryptDecrypt(LOG_PASSWORD, customizer, LOG_ENCRYPT_CHARS, attemptedSolution, true);

            rawLog(puzzleId, responseCode, attemptedSolution);

        }

        private void rawLog(string puzzleId, string responseCode, string extraText)

        // Format:
        // Transaction ID, time, 'T'+TeamID, TeamName, 'P'+PuzzleID, Code, Hash, Solution attempt (Hash is secret hash of teamID, puzzleID and responseCode)
        // Az3409zz.1, 16:05:35.356, T6, ATDT rules again, P101, [CORRECT], [BOWMANBAY]
        // Note T added before team ID, and P added before puzzle ID. That's part of the submission log spec.
        {
            if (this.fatalError)
            {
                Trace.WriteLine("Ignoreing log attempt because internal state indicates earlier fatal error!");
                return;
            }
            try
            {
                this.transactionCount++;
                extraText = Regex.Replace(extraText, "[\"',\\n\\r]", ""); // strip CSV meta-chars, if any
                String transaction = this.transactionIdBase + "." + this.transactionCount;
                String timeStamp = DateTime.Now.ToString("HH:mm:ss");
                //String[] hashStrings = { teamId, puzzleId, responseCode };
                //String hash = CryptoHelper.MD5Base64Hash(HASH_PASSWORD, hashStrings).Substring(0,8);
                this.tw.WriteLine(String.Format("{0},{1},{2},{3},{4},{5},{6}",
                    transaction, timeStamp, teamId, this.teamName, puzzleId, responseCode, extraText));
                this.tw.Flush();
            }
            catch (IOException e)
            {
                fatalError = true;
                ErrorReport.logError("Error attempting to write to submission log. Exception = " + e.Message);
                throw new ApplicationException("Cannot write to submission log!");
                //this.ioExceptionCount
            }
        }


        public void Dispose()
        {
            if (tw != null)
            {
                try
                {
                    logMetaStatus("LOG_STOPPED");
                    tw.Flush(); // sync
                    tw.Dispose();
                    tw = null;
                }
                catch (IOException e)
                {
                    fatalError = true;
                    ErrorReport.logError("Error attempting to write to submission log. Exception = " + e.Message);
                    throw new ApplicationException("Cannot write to submission log!");
                    //this.ioExceptionCount
                }
            }
        }
    }
}
