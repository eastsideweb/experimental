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
        static String[] tickets = {
"AAA", "BBB", "CCC", "DDD","EEE"
                                  };
        static String[] activityTypeFormatStrings = {
                                            // {0} is oracle response, {1} is activity name and {2} is ticket
                                            "{0}\nCONGRATULATIONS, you have unlocked challenge \"{1}\"!"
                                            + " Two members of your guild should present secret code \"{2}\" to the \"{1}\" challenge station."
                                            + " Do not share this code with another clan.",
                                            "{0}\nCONGRATULATIONS, your guild has won ticket \"{2}\" to a QUEST."
                                            + " Two members of your guild should present this ticket to central command for further instructions."
                                            //+ " Please give someone in your guild who has not yet gone on a quest the chance to do so."
                                            + " Do not share this ticket with another clan!"
                                        };
        static string[] challengeNames =
        {
            "Go Biology"
        };

        static string[] questNames = 
        {
            null // Quests don't have names
        };

        static string[][] activityNames = 
        {
            challengeNames,
            questNames
        };

        static int[,] activityData = {
                                         // PuzzleID, ActivityType, ActivityIndex, TicketIndex
                                         {998, 0, 0, 0},
                                         {999, 1, 0, 1}
                                         //{333, 1, 1, 2}
                                     };

        // Build puzzle-specific extended response that gives instructions on next steps,
        // given the player's puzzle response.
        public static string buildExtendedResponse(string id, PuzzleResponse pr)
        {
            if (pr.code != PuzzleResponse.ResponseCode.Correct)
            {
                return "";
            }
            String response = "";

            int puzzleId  = Convert.ToInt32(id);
            Debug.Assert(puzzleId >= 100 && puzzleId <= 999);
            for (int i = 0; i < activityData.GetLength(0); i++)
            {
                if (activityData[i, 0] == puzzleId)
                {
                    int activityType = activityData[i, 1];
                    int activityIndex = activityData[i, 2];
                    int ticketIndex = activityData[i, 3];
                    String activity = activityNames[activityType][activityIndex];
                    String ticket = tickets[ticketIndex];
                    string format = activityTypeFormatStrings[activityType];
                    response = String.Format(format, pr.response, activity, ticket);
                }
            }
            return response;
        }
    }
}
