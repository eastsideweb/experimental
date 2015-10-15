//
// MODULE: Puzzle Oracle - for A Puzzle Oracle for Puzzle Events
// File: SimpleSpreadsheetReader.cs
//
// HISTORY
//   September 2015 Joseph M. Joy Created

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PuzzleOracleV0
{

    /// <summary>
    /// Really simple way to get to spreadsheet data
    /// </summary>
    interface SimpleSpreadsheetReader
    {
        /// <summary>
        /// Get names of all sheets in spreadsheet
        /// </summary>
        /// <returns>sheet names</returns>
        string[] getSheetNames();

        /// <summary>
        /// Get number of rows
        /// </summary>
        /// <param name="sheet"></param>
        /// <returns></returns>
        int getNumRows(int sheet = 0);

        /// <summary>
        /// Get number of columns
        /// </summary>
        /// <param name="sheet"></param>
        /// <returns></returns>
        int getNumCols(int sheet = 0);

        /// <summary>
        /// Get range of cells in row between fromCol and toCol, inclusive.
        /// </summary>
        /// <param name="fromCol"></param>
        /// <param name="toCol"></param>
        /// <param name="sheet"></param>
        /// <returns>Cell content as a string</returns>
        string[] getRowCells(int row, int fromCol, int toCol, int sheet = 0);

        /// <summary>
        /// Get range of cells in column between fromRow and toRow, inclusive.
        /// </summary>
        /// <param name="fromRow"></param>
        /// <param name="toRow"></param>
        /// <param name="sheet"></param>
        /// <returns>Cell content as a string</returns>
        string[] getColCells(int col, int fromRow, int toRow, int sheet = 0);
    }
}
