using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace LogProcessorSample
{
    /// <summary>
    /// DO NOT MODIFY THIS FILE - this is a subset of Puzzle Oracle's Crypto helper class - specifically 
    /// the simpleEncryptDecrypt static method and the methods it calls.
    /// </summary>
    class CryptoHelperCopy
    {
        // DO NOT MODIFY
        public static String simpleEncryptDecrypt(String password, String customizer, String encryptChars, String input, Boolean encrypt)
        {
            int[] offsets = generateRandomOffsets(password, customizer, encryptChars, input.Length);
            StringBuilder sb = new StringBuilder(input.Length);
            for (int i = 0; i < input.Length; i++)
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

        // DO NOT MODIFY
        private static int[] generateRandomOffsets(string password, string customizer, string encryptChars, int length)
        {

            int[] a = new int[length];
            ulong x = runLCG(customizer, 0); // Prime the LCR with the customizer chars.
            for (int i = 0; i < a.Length; i++)
            {
                x = runLCG(password, x);
                a[i] = (int)((x >> 4) % (ulong)encryptChars.Length); // >> 4 is to shave off some LS bits, which are less random.
            }
            return a;
        }

        /// <summary>
        /// DO NOT MODIFY
        /// Transorms xPrev into a new pseudorandom value by repeatedly using Knuth's LCG algorithm.
        /// Password chars are used to make jumps before each successive LCG step.
        /// Note: if password is empty, xPrev is returned unmodified.
        /// </summary>
        /// <param name="password"></param>
        /// <param name="xPrev"></param>
        /// <returns></returns>
        public static ulong runLCG(String password, ulong xPrev)
        {
            // Knuth NMIX LCG from https://en.wikipedia.org/wiki/Linear_congruential_generator (verified by JMJ by checking various
            // other independent sources online on September 16th, 2015.)
            // Xn+1 = (A Xn + C) mod M
            //MMIX by Donald Knuth:	M=2^64	A=6364136223846793005	C=1442695040888963407	
            const ulong A = 6364136223846793005UL;
            const ulong C = 1442695040888963407UL;
            ulong x = xPrev;
            foreach (char c in password)
            {
                x += (ushort)c; // Jump by the next password char.
                // OLD: x = (8121 * x + 28411) % 134456; // Knuth LCG
                x = A * x  + C; // Note that mod M is implied byecause M = 2^64 which is the size of ulong.
                //Trace.WriteLine(String.Format("[{0}] {1}", c, x));
            }
            return x;
        }

        // DO NOT MODIFY
        public static void testSimpleEncryptDecrypt()
        {
            String input = "Hello!";
            String encryptChars = "abcdefghijklmnopqrstuvwxyz";
            String password = "fop";
            String encrypted = simpleEncryptDecrypt(password, "0", encryptChars, input, true);
            String decrypted = simpleEncryptDecrypt(password, "0", encryptChars, encrypted, false);
            Trace.WriteLine(input + "->" + encrypted + "->" + decrypted);
            encrypted = simpleEncryptDecrypt(password, "1", encryptChars, input, true);
            decrypted = simpleEncryptDecrypt(password, "1", encryptChars, encrypted, false);
            Trace.WriteLine(input + "->" + encrypted + "->" + decrypted);
        }
    }
}
