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

        class MySimpleSpreadsheetReader : SimpleSpreadsheetReader
        {
            string[][,] data = {
                // sheet 1 Special: _C (Correct!) _KG (Keep going, you're on the right track.)  _WT (You're on the wrong grack.)
                new string[,] {{"Id ", "Name", "Answer", "Hint1", "Hint2"}, 
                 {"100", "Puzzle1", "ABC|DEF", "GHI|JKL:_KG", "LMN|OPQ:_WT"},
                 {"101", "Laser I", "BOWMANBAY: _C\n\nCongratulations! You have been awarded a challenge ticket to challenge GO BIOLOGY. Entry code QWRTX.", "GHI|JKL:_KG", "LMN|OPQ:_WT"}
                                 },

                // sheet 2
                new string[,] {{"2"}, {"4"}}
            };

            String[] sheetNames = { "Sheet1", "Sheet2" };


            public MySimpleSpreadsheetReader()
            {
   
                /*int[, ,] array2 = { { { 1, 2, 3, 3 }}, { { 7, -1, 9, 0 } }, { { -1, 0, 7, 8 } 


} };  */

            }

            public string[] getSheetNames()
            {
                return sheetNames;
            }

            public int getNumRows(int sheet = 0)
            {
                string[,] sheetData = data[sheet];
                return sheetData.GetUpperBound(0)+1;
            }

            public int getNumCols(int sheet = 0)
            {
                string[,] sheetData = data[sheet];
                return sheetData.GetUpperBound(1)+1;
            }

            public string[] getRowCells(int row, int fromCol, int toCol, int sheet = 0)
            {
                string[,] sheetData = data[sheet];
                int n = toCol - fromCol + 1;
                string[] rows = new string[n];
                for (int i = 0; i < n; i++)
                {
                    rows[i] = sheetData[row, fromCol + i];
                }
                return rows;
            }


            public string[] getColCells(int col, int fromRow, int toRow, int sheet = 0)

            {
                string[,] sheetData = data[sheet];
                int n = toRow - fromRow;
                string[] cols = new string[n];
                for (int i = 0; i < n; i++)
                {
                    cols[i] = sheetData[fromRow + i, col];
                }
                return cols;
            }
        }
    }
}
