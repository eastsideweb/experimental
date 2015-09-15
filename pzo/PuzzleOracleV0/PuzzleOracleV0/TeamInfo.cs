using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{
    class TeamInfo
    {
        public readonly String teamId;
        public readonly String teamName;
        public TeamInfo(String id, String name) {
            teamId = id;
            teamName = name; 
        }
    }
}
