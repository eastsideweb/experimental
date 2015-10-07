using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Diagnostics;


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

        public static String simpleEncryptDecrypt(String password, int sequenceNo, String  encryptChars, String input, Boolean encrypt)  {
            int[] offsets = generateRandomOffsets(password, sequenceNo, encryptChars, input.Length);
            StringBuilder sb = new StringBuilder(input.Length);
            for (int i = 0; i < input.Length;i++)
            {
                char c = input[i];
                char c2 = c;
                int j = encryptChars.IndexOf(c);
                if (j != -1)
                {
                    int m = offsets[i];
                    if (!encrypt)
                    {
                        // Go backwards to decrypt
                        m = encryptChars.Length - m;
                        Debug.Assert(m > 0 && m <= encryptChars.Length); // we use % Length below.
                    }
                    int n = (j + m) % encryptChars.Length;
                    c2 = encryptChars[n];
                }
                sb.Append(c2);
            }
            return sb.ToString();
        }

        private static int[] generateRandomOffsets(string password, int sequenceNo, string encryptChars, int length)
        {
            int[] a = new int[length];
            return a;
        }

        public static void testSimpleEncryptDecrypt() {
            String input = "Hello!";
            String encryptChars = "abcdefghijklmnopqrstuvwxyz";
            String encrypted = simpleEncryptDecrypt("foo", 0, encryptChars, input, true);
            String decrypted = simpleEncryptDecrypt("foo", 0, encryptChars, encrypted, false);
            Trace.WriteLine(input + "->" + encrypted + ">" + decrypted);
        }
    }
}
