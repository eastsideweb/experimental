using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{
    class TestExcelReader 
    {


        public static SimpleSpreadsheetReader loadSpreadsheet(String pathName, String password = null)
        {
            return new MySimpleSpreadsheetReader();
        }

        class MySimpleSpreadsheetReader :  SimpleSpreadsheetReader
        {


            public MySimpleSpreadsheetReader()
            {
              string[][,] array = {
                // sheet 1
                new string[,] {{"Number", "Name", "Answer", "Hint1", "Hint2"}, 
                 {"100", "Puzzle1", "ABC|DEF", "GHI|JKL:_KG", "LMN|OPQ:_WT"}
                                 },

                // sheet 2
                new string[,] {{"2"}, {"4"}}
            };
                int[, ,] array2 = { { { 1, 2, 3, 3 }}, { { 7, -1, 9, 0 } }, { { -1, 0, 7, 8 } 


} }; // 3D 

            }

            public string[] getSheetNames()
            {
                return null;
            }

            public int getNumRows(int sheet = 0)
            {
                return 0;
            }

            public int getNumCols(int sheet = 0)
            {
                return 0;
            }

            public string[] getRowCells(int fromCol, int toCol, int sheet = 0)
            {
                return null;
            }


            public string[] getColCells(int fromRow, int toRow, int sheet = 0)
            {
                return null;
            }
        }
    }
}
