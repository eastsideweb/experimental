using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;


namespace PuzzleOracleV0
{
    class CryptoHelper
    {
        // Code taken from a stackoverflow example
        public static string EncodeToBase64(string input)
        {
            byte[] bytes = Encoding.Unicode.GetBytes(input);
            byte[] inArray = HashAlgorithm.Create("MD5").ComputeHash(bytes);
            return Convert.ToBase64String(inArray);
        }
    }
}
