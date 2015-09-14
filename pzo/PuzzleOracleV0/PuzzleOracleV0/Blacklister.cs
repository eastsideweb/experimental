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
        int totalAttempts;
        int attemptsSinceBlacklist;
        DateTime blackListStartTime = new DateTime(2015, 1, 1); // some time in the distant past

        // TEMP only
        Random random = new Random();


        /// <summary>
        /// Delay (if any) before the next submission should be excepted.
        /// </summary>
        /// <returns>-1 if ok to submit now. Else delay in *seconds*</returns>
        public int submitDelay
        {
            get { return random.Next(-1,120); }
        }

        /// <summary>
        /// Register the fact that a submission was accepted.
        /// </summary>
        /// <param name="sucess">Whether the solution was correct or not.</param>
        public void registerSubmission()
        {

        }   
    }
}
