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
        const int IDLE_TIMER_MS = 30000; // 30 seconds

        PuzzleOracle oracle;
        SimpleSpreadsheetReader excelReader;


        #region UX_CONTROLS
        Color color_NotFound;
        Color color_Found;
        Color color_CorrectAnswer;
        Color color_IncorrectAnswer;
        Color color_DelayedAnswer;
        System.Windows.Forms.Timer myTimer;
        #endregion UX_CONTROLS

        public Form1()
        {
            InitializeComponent();
            initializeUx();
            initializeOracle();
        }

        private void initializeUx()
        {
            color_NotFound = Color.FromName("Orange");
             color_Found = Color.FromName("Green");

             color_CorrectAnswer = Color.FromName("Green");
             color_IncorrectAnswer = Color.FromName("Orange");
             color_DelayedAnswer = Color.FromName("Black");

            myTimer = new System.Windows.Forms.Timer();
            myTimer.Tick += myTimer_Tick;
            myTimer.Interval = IDLE_TIMER_MS;
            uxResetIdleTimer();

        }

        void myTimer_Tick(object sender, EventArgs e)
        {
            Debug.WriteLine("IDLE TIMER HIT!");
             this.textBox_PuzzleId.Text = "";
            uxClearAndHideSubmission();
            myTimer.Enabled = false;
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
            uxResetIdleTimer();

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

        /// <summary>
        /// Resets the idle timer (see uxIdleTimerFired() for more details)
        /// </summary>
        private void uxResetIdleTimer()
        {
            //myTimer.Interval = IDLE_TIMER_MS;
            myTimer.Enabled = false;
            myTimer.Enabled = true;
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
            this.panel_Response.Hide();
            this.textBox_PuzzleId.Focus();
        }

        private void uxSetPuzzleFound(string name)
        {
            this.label_PuzzleName.Text = name;
            this.label_PuzzleName.ForeColor = this.color_Found;
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
            this.label_PuzzleName.ForeColor = this.color_NotFound;
            this.label_Name.Hide();
            this.panel_Name.Show();
            uxClearAndHideSubmission();
        }

        private void textBox_Answer_TextChanged(object sender, EventArgs e)
        {
            String text = this.textBox_Answer.Text;
            Debug.WriteLine("Something was typed! ["+text+"]");
            uxResetIdleTimer();

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
            this.panel_Response.Hide();
            this.richTextBox_Response.Text = "";
            this.button1.Show();
        }

        private void uxHideSubmission()
        {
            this.button1.Hide();
        }

        
        private void button1_Click(object sender, EventArgs e)
        {
            Debug.WriteLine("Verify button clicked!");
            uxResetIdleTimer();
            String id = this.textBox_PuzzleId.Text;
            String answer = this.textBox_Answer.Text;

            // Let's ask the oracle!
            PuzzleResponse pr = oracle.checkSolution(id, answer);
            uxDisplayResponse(pr);
        }

        private void uxDisplayResponse(PuzzleResponse pr)
        {
            Color c = this.color_IncorrectAnswer;
            if (pr.type == PuzzleResponse.ResponseType.Correct)
            {
                c = this.color_CorrectAnswer;
            }
            else if (pr.type == PuzzleResponse.ResponseType.AskLater)
            {
                c = this.color_DelayedAnswer;
            }
            this.richTextBox_Response.ForeColor = c;
            this.richTextBox_Response.Text = pr.response;
            this.button1.Hide();
            this.panel_Response.Show();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

    }
}
