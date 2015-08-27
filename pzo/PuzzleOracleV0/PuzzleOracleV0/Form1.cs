using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;

namespace PuzzleOracleV0
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void textBox_PuzzleNumber_TextChanged(object sender, EventArgs e)
        {
            Debug.WriteLine("Something was typed!");
        }

        private void textBox_Answer_TextChanged(object sender, EventArgs e)
        {
            Debug.WriteLine("Something was typed!");
        }

        private void richTextBox_Response_TextChanged(object sender, EventArgs e)
        {

        }

        private void label5_Click(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {

        }
    }
}
