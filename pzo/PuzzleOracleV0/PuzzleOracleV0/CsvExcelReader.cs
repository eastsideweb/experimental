using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace PuzzleOracleV0
{
    class CsvExcelReader : SimpleSpreadsheetReader
    {
        String[][] cells;
        int maxCols;

        private CsvExcelReader(String[][] cells, int maxCols)
        {
            this.cells = cells; this.maxCols = maxCols;
        }

        public static SimpleSpreadsheetReader loadSpreadsheet(String pathName)
        {
            try
            {
                using (TextReader tr = new StreamReader(pathName))
                {
                    String allText = tr.ReadToEnd();
                    String[] delims = { "\r\n" };
                    String[] lines = allText.Split(delims, StringSplitOptions.None);
                    String[][] cells = null;
                    int nrows = lines.Length;
                    int ncols = 0;
                    // don't count the final, empty string.
                    if (nrows > 0 && lines[nrows - 1].Length == 0)
                    {
                        nrows--;
                    }
                    if (nrows > 0)
                    {
                        cells = new String[nrows][];
                        ncols = 0;
                        for (int i = 0; i < nrows; i++)
                        {
                            String[] cols = parseRow(lines[i]);
                            if (cols.Length > ncols)
                            {
                                ncols = cols.Length;
                            }
                            cells[i] = cols;
                        }
                    }

                    if (nrows == 0 || ncols == 0)
                    {
                        nrows = ncols = 0;
                        cells = null;
                    }
                    return new CsvExcelReader(cells, ncols);
                }
            }
            catch (IOException e)
            {
                String message = String.Format("IO exception attempting to process file [{0}]", pathName);
                if (e is FileNotFoundException)
                {
                    message = String.Format("File [{0}] not found.", pathName);
                }
                Trace.WriteLine(message + e);
                ErrorReport.logError(message);
                throw new ArgumentException(message);
            }
        }

        private static String[] parseRow(string p)
        {
            String quoteChar = "\001"; // "\0}
            String commaChar = "\002";
            // Replace "" by qCHar ("" represents a single ").
            String s = Regex.Replace(p, "\"\"", quoteChar);

            //s = Regex.Replace(s, "\r", "Y", RegexOptions.Multiline);
            String t = Regex.Replace(s, "\"[^\"]+\"", delegate(Match match)
            {
                string v = match.Value; // match.ToString();
                Debug.Assert(v.Length >= 2); // because of the beginning and ending " chars.
                v = v.Substring(1, v.Length - 2);
                return Regex.Replace(v, ",", commaChar);
            });
            String[] parts = t.Split(',');
            int nCols = parts.Length;
            // Strip ending empty part, if any
            if (nCols > 0 && parts[nCols - 1].Length == 0)
            {
                nCols--;
            }
            String[] sCols = new String[nCols];
            for (int i = 0; i < nCols; i++)
            {
                String x = Regex.Replace(parts[i], quoteChar, "\"");
                String y = Regex.Replace(x, commaChar, ",");
                sCols[i] = y;
            }

            return sCols;
            //Trace.WriteLine(s);
        }

        public string[] getSheetNames()
        {
            String[] names = { "Sheet1" };
            return names;
        }

        public int getNumRows(int sheet = 0)
        {
            checkSheet(sheet);
            return cells == null ? 0 : cells.Length;
        }

        private void checkSheet(int sheet)
        {
            if (sheet != 0)
            {
                throw new ArgumentException("Invalid sheet " + sheet);
            }
        }

        public int getNumCols(int sheet = 0)
        {
            return maxCols;
        }

        public string[] getRowCells(int row, int fromCol, int toCol, int sheet = 0)
        {
            checkSheet(sheet);
            checkRow(row);
            checkCol(fromCol);
            checkCol(toCol);
            string[][] sheetData = cells;
            int n = toCol - fromCol + 1;
            string[] rows = new string[n];
            String[] sRow = sheetData[row];
            for (int i = 0; i < n; i++)
            {
                int col = fromCol + i;
                rows[i] = col < sRow.Length ? sRow[col] : "";
            }
            return rows;
        }

        private void checkCol(int col)
        {
            if (col < 0 || col >= maxCols)
            {
                throw new ArgumentException("Invalid col " + col);
            }
        }

        private void checkRow(int row)
        {
            if (row < 0 || row >= cells.Length)
            {
                throw new ArgumentException("Invalid row " + row);
            }
        }

        public string[] getColCells(int col, int fromRow, int toRow, int sheet = 0)
        {
            checkSheet(sheet);
            checkCol(col);
            checkRow(fromRow);
            checkRow(toRow);
            string[][] sheetData = cells;
            int n = toRow - fromRow;
            string[] cols = new string[n];
            for (int i = 0; i < n; i++)
            {
                String[] sRow = sheetData[fromRow + i];
                cols[i] = (col < sRow.Length) ? sRow[col] : "";
            }
            return cols;
        }
    }
}
