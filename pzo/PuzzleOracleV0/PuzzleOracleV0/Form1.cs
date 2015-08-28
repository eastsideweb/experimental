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
        const int MIN_PUZZLE_ID_LENGTH = 3;

        PuzzleOracle oracle;
        SimpleSpreadsheetReader excelReader;

        Color notFoundColor  = Color.FromName("Orange");
        Color foundColor = Color.FromName("Green");


        public Form1()
        {
            InitializeComponent();
            initializeOracle();
        }

        private void initializeOracle()
        {
            string pathName = "fooPath";
            string password = "oaktree";
            excelReader = TestExcelReader.loadSpreadsheet(pathName, password);
            oracle = new PuzzleOracle(excelReader);
        }

        private void textBox_PuzzleId_TextChanged(object sender, EventArgs e)
        {
            Debug.WriteLine("Something was typed! [" + this.textBox_PuzzleId.Text+"]");
            // Check that what was typed is a valid puzzle ID...
            String id = this.textBox_PuzzleId.Text;
            if (id.Length >= MIN_PUZZLE_ID_LENGTH)
            {
                String name = oracle.tryGetName(id);
                if (name == null)
                {
                    // No patch (yet)
                    uxSetPuzzleNotFound();
                }
                else
                {
                    // Matches a puzzle...
                    uxSetPuzzleFound(name);
                }
            }
            else
            {
                uxSetIncompletePuzzleId();
            }
        }

        private void uxSetIncompletePuzzleId()
        {
            this.label_PuzzleName.Text = "";
            this.panel_Name.Hide();
            uxClearAndHideSubmission();

        }

        private void uxClearAndHideSubmission()
        {
            this.textBox_Answer.Text = "";
            //this.textBox_Answer.Hide();
            this.panel_Answer.Hide();
            this.button1.Hide();
            this.richTextBox_Response.Text = "";
            //this.richTextBox_Response.Hide();
        }

        private void uxSetPuzzleFound(string name)
        {
            this.label_PuzzleName.Text = name;
            this.label_PuzzleName.ForeColor = this.foundColor;
            this.label_Name.Show();
            this.panel_Name.Show();
            uxEnableAnswer();
        }

        private void uxEnableAnswer()
        {
            this.textBox_Answer.Text = "";
            this.panel_Answer.Show();
            this.textBox_Answer.Focus();
        }

        private void uxSetPuzzleNotFound()
        {
            this.label_PuzzleName.Text = "No such puzzle.";
            this.label_PuzzleName.ForeColor = this.notFoundColor;
            this.label_Name.Hide();
            this.panel_Name.Show();
            uxClearAndHideSubmission();
        }

        private void textBox_Answer_TextChanged(object sender, EventArgs e)
        {
            String text = this.textBox_Answer.Text;
            Debug.WriteLine("Something was typed! ["+text+"]");
            if (text.Length == 0)
            {
                uxHideSubmission();
            }
            else
            {
                uxEnableSubmission();
            }

        }

        private void uxEnableSubmission()
        {
            this.button1.Show();
        }

        private void uxHideSubmission()
        {
            this.button1.Hide();
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
