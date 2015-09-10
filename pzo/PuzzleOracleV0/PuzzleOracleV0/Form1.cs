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
using System.Runtime.InteropServices.WindowsRuntime;  

namespace PuzzleOracleV0
{


    public partial class Form1 : Form
    {
        const int MIN_PUZZLE_ID_LENGTH = 3;
        const int IDLE_TIMER_MS = 30000; // 30 seconds
        const String ORACLE_DATA_FILENAME = "PuzzleOracle\\data.csv"; // Unencrypted: .csv, encrypted: .pod (for puzzle oracle date)

        PuzzleOracle oracle;
        SimpleSpreadsheetReader excelReader;
        Boolean fullScreen = false;


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
            if (trySwitchToOtherInstance())
            {
                Close();
                return;
            }
            InitializeComponent();
            initializeUx();
            initializeOracle();
        }

        private bool trySwitchToOtherInstance()
        {
            var me = Process.GetCurrentProcess();
            var otherMe = Process.GetProcessesByName(me.ProcessName).Where(p => p.Id != me.Id).FirstOrDefault();

            if (otherMe != null)
            {
                MessageBox.Show("Exiting Duplicate Instance", "Puzzle Oracle", MessageBoxButtons.OK);
#if false
                //note IntPtr expected by API calls.
                IntPtr hWnd = otherMe.MainWindowHandle;
                //restore if minimized
                ShowWindow(hWnd, 1);
                //bring to the front
                SetForegroundWindow(hWnd);
#endif
                return true;
            }
            else
            {
                //run your app here
                return false;
            }
        }

        private void initializeUx()
        {
            // Handle keys (temporary - to capture the F1 key to experiment with full-screen mode, etc.)
            this.KeyUp += new System.Windows.Forms.KeyEventHandler(KeyEvent);
            this.KeyPreview = true;


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

        private void KeyEvent(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.F1)
            {
                //MessageBox.Show("Function F6");
                fullScreen = !fullScreen;
                GoFullscreen(fullScreen);
            }

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
            string pathName = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) + "\\" + ORACLE_DATA_FILENAME;
            string password = "oaktree";
            SimpleSpreadsheetReader sr = CsvExcelReader.loadSpreadsheet(pathName, password);
            //excelReader = TestExcelReader.loadSpreadsheet(pathName, password);
            oracle = new PuzzleOracle(sr);
        }

        private void textBox_PuzzleId_TextChanged(object sender, EventArgs e)
        {
            Debug.WriteLine("Something was typed! [" + this.textBox_PuzzleId.Text + "]");
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
            Debug.WriteLine("Something was typed! [" + text + "]");
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

        private void GoFullscreen(bool fullscreen)
        {
            if (fullscreen)
            {
                this.WindowState = FormWindowState.Normal;
                this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
                this.Bounds = Screen.PrimaryScreen.Bounds;
            }
            else
            {
                this.WindowState = FormWindowState.Maximized;
                this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Sizable;
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            Boolean cancel = false;

            if (e.CloseReason == CloseReason.UserClosing)
            {
                string message = "Confirm close?";
                string caption = "Close Puzzle Oracle";
                MessageBoxButtons buttons = MessageBoxButtons.YesNo;
                var result = MessageBox.Show(message, caption, buttons);

                if (result == System.Windows.Forms.DialogResult.No)
                {
                    cancel = true;
                }
            }

            if (cancel)
            {
                e.Cancel = true;
            }
            else
            {
                base.OnFormClosing(e);
            }

        }

    }
}
