using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{
    /// <summary>
    /// Manages blacklist state for a single puzzle
    /// </summary>
    class Blacklister
    {
        // Blacklist parameters.
        // Currently these are constants. In the future they could be
        // specified as data parameters (the first row of the data pod spreadsheet stores parameters)
        const int MAX_TOTAL_ATTEMPTS = 16;
        const int MAX_ATTEMPTS_PER_SESSION = 4;
        const int BLACKLIST_TIME_SECONDS = 30;

        public const int BLACKLIST_FOREVER_TIME = 1000000; // effectively forever.

        int totalAttempts = 0;
        int attemptsAtSessionStart = 0;
        DateTime blackListStartTime = new DateTime(2015, 1, 1); // some time in the distant past
        Boolean blacklisted = false;
        Boolean permanentlyBlacklisted = false;
        String puzzleId;

        // TEMP only
        Random random = new Random();

        public Blacklister(String puzzleId)
        {
            this.puzzleId = puzzleId;
        }

        /// <summary>
        /// Delay (if any) before the next submission should be excepted.
        /// </summary>
        /// <returns>0 if ok to submit now. Else delay in *seconds*. Special value BLACKLIST_FOREVER_TIME means permanent blacklisting.</returns>
        public int submitDelay
        {
            get {
                if (!blacklisted)
                {
                    return 0;
                }
                else if (permanentlyBlacklisted)
                {
                    return BLACKLIST_FOREVER_TIME;
                } else {                  
                    DateTime now = DateTime.Now;
                    TimeSpan delta = now.Subtract(blackListStartTime);
                    int seconds = (int) (delta.Seconds+0.5); // round up
                    if (seconds < BLACKLIST_TIME_SECONDS)
                    {
                        int d = BLACKLIST_TIME_SECONDS - seconds;
                        // TODO: Round up to nearest 10 seconds if less than 120 seconds. Else round to nearest minute.
                        // For now we don't enable this logic so we can do some end-to-end accuracy testing.
                        return d;
                    }
                    else
                    {
                        // we're past blacklist time...
                        return 0;
                    }
                }
            }
        }

        /// <summary>
        /// Register the fact that a submission was accepted.
        /// </summary>
        /// <param name="sucess">Whether the solution was correct or not.</param>
        public void registerSubmission()
        {
            totalAttempts++;
            Boolean attemptsPermanentlyExceeded = totalAttempts >= MAX_TOTAL_ATTEMPTS;

            if (attemptsPermanentlyExceeded)
            {
                // Turn on PERMANENT blacklisting
                blacklisted = permanentlyBlacklisted = true;
                blackListStartTime = DateTime.Now;
                return; //                ----------------------------- EARLY RETURN
            }

            if (blacklisted)
            {
                if (submitDelay == 0)
                {
                    // Switching out of blacklist!
                    blacklisted = false;
                    attemptsAtSessionStart = totalAttempts-1;
                }
            }
            else
            {
                Boolean attemptsTemporarilyExceeded = (totalAttempts - attemptsAtSessionStart) >= MAX_ATTEMPTS_PER_SESSION;
                if  (attemptsTemporarilyExceeded) {
                    // Turn on blacklisting -- applies to NEXT submission, not this one.
                    blacklisted = true;
                    blackListStartTime = DateTime.Now;
                } 
            }
        }   
    }
}
