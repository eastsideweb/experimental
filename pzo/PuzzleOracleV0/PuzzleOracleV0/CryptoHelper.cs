using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text.RegularExpressions;


namespace PuzzleOracleV0
{
    class CryptoHelper
    {
        // Code taken from a stackoverflow example
        public static string MD5Base64Hash(string input)
        {
            byte[] bytes = Encoding.Unicode.GetBytes(input);
            byte[] inArray = HashAlgorithm.Create("MD5").ComputeHash(bytes);
            return Convert.ToBase64String(inArray);
        }

        /// <summary>
        /// Computes and returns a MD5 hash by combining password and all the individual strings in the fields array.
        /// </summary>
        /// <param name="password"></param>
        /// <param name="fields"></param>
        /// <returns></returns>
        public static string MD5Base64Hash(string password, string[] fields)
        {
            String s = password;
            foreach (string f in fields)
            {
                s += f;
            }
            return MD5Base64Hash(s);
        }

        public static string convertToUrlFileSafeBase64(String s)
        {
            // Standard 'base64url' with URL and Filename Safe  - see https://en.wikipedia.org/wiki/Base64
            return s.Replace('+', '-').Replace('/', '_');
        }


        /// <summary>
        /// Generates a string that consists of base-64 encoded random bytes.
        /// The string is safe for use withing file names or URLs (- is used instead of + and _ is used instead of /).
        /// </summary>
        /// <param name="seed"></param>
        /// <param name="byteCount"></param>
        /// <returns></returns>
        public static string generateRandomSafeBase64string(int seed, int byteCount)
        {
            byte[] bytes = new byte[byteCount];
            Random rand = new Random(seed);
            rand.NextBytes(bytes);
            String s = convertToUrlFileSafeBase64(Convert.ToBase64String(bytes));
            return s;
        }
    }
}
