// Encrypt/Decrypt blocks of cells in a CSV file using permutation-based encryption.


void setup() {
  Table table = loadTable("C:\\PuzzleOracle\\data.csv");
  int nRows = table.getRowCount();
  println(nRows + " total rows in table"); 

  for (int i=2;i<nRows;i++) {
    TableRow row = table.getRow(i);
    String puzzle = row.getString(0);
    
    println("row[" + i + "]; puzzle[" + puzzle + "]");
  }
  
}
 


/// Decrypt the columns in the range (inclusive)

private void decryptCells(String[] sRow, int fromCol, int toCol)
{
  String charsToPermute = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  String permutedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";

  for (int i = fromCol; i <= toCol && i < sRow.length; i++)
  {
    String s = sRow[i];
    if (s.length() < 2 || s.charAt(0) != '[' || s.charAt(s.length() - 1) != ']')
    {
      println("Ignoring attempt to encrypt unencrypted cell " + s);
      continue;
    }
    String t = permute(s.substring(1, s.length()-1), permutedChars, charsToPermute);
    sRow[i] = t;
  }
}

private String permute(String s, String p1, String p2)
{
  assert(p1.length() == p2.length());
  String t = "";
  for (int i=0; i<s.length(); i++)
  {
    char c = s.charAt(i);
    int c2 = c;
    int j = p1.indexOf(c);
    if (j != -1)
    {
      c2 = p2.charAt(j);
    }
    t += c2;
  }

  return t;
}