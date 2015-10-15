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
using System.Text.RegularExpressions;
using System.IO;




namespace PuzzleOracleV0
{


    public partial class Form1 : Form
    {
        const string INSTRUCTOR_CODE = "pixie";
        const int MIN_PUZZLE_ID_LENGTH = 3;
        const int MIN_CODE_LENGTH = 5; // Instructor code
        const int IDLE_TIMER_MS = 30000; // 30 seconds
        const String ORACLE_DATA_DIR = "PuzzleOracle";
        const String ORACLE_DATA_FILENAME = "puzzle-data.csv";
        const String TEAM_DATA_FILENAME = "team-data.csv";
        const String TEAM_ID_FILENAME = "puzzle-team-id.txt";
        const String OVERRIDE_TEAM_DATA_FILENAME = "current-team.txt";
        const String LOG_DATA_DIRNAME = "logs";
        const String TEST_LOG_DATA_DIRNAME = "testLogs"; // for synthetic test logs (created with the -tldgen cmdline argument)
        const String INVALID_TEAM_ID = "T0";
        const String INVALID_TEAM_NAME = "NO TEAM ASSIGNED TO THIS MACHINE";

        // To store relative position of top-level controls
        class RelativePosition
        {
            public Control c;
            public double fractionFromTop;
            public RelativePosition(Control c, double fractionFromTop)
            {
                this.c = c;
                this.fractionFromTop = fractionFromTop;
            }
        }

        TeamInfo teamInfo;
        PuzzleOracle oracle;
        OracleSubmissionLogger oracleLogger;
        Boolean fullScreen = false;
        public Boolean okToClose = false;
        Boolean fatalError = false; // close immediately

        // Basic modes of operation (with different layout)
        enum Mode
        {
            modePreInit,
            modeInit,
            modeOracle,
            modeExit
        };
        Mode mode = Mode.modePreInit;



        #region UX_CONTROLS
        Color color_NotFound;
        Color color_Found;
        Color color_CorrectAnswer;
        Color color_IncorrectAnswer;
        Color color_IncorrectCode;
        Color color_DelayedAnswer;
        Color color_EditBox;
        System.Windows.Forms.Timer myTimer;
        List<Control> hideableControls = new List<Control>(); // different panels to hide in one swoop
        List<Control> clearableTextControls = new List<Control>(); // different controls to clear text in one swoop
        List<RelativePosition> relativePositions = new List<RelativePosition>();
        private bool selfTestMode;
        private string selfTestTeamId;
        private bool generateTestLogDataAndExit;

        #endregion UX_CONTROLS

        public Form1()
        {
            CryptoHelper.testSimpleEncryptDecrypt();

            parseCmdlineArgs();
  


            // Unless we're in self-test mode, we only allow one instance.
            if (!this.selfTestMode && trySwitchToOtherInstance())
            {
                Close();
                return;
            }

            try
            {
                InitializeComponent();
                initializeUx();
                initializeTeamInfo();
                initializeOracleLogger();
                initializeOracle();

                // If we're generating test log data, we do that and exit.
                if (this.generateTestLogDataAndExit)
                {
                    generateTestLogData();
                    okToClose = true;
                    return;
                }
            }
            catch (ApplicationException e)
            {
                handleFatalError(e);

            }
            catch (ArgumentException e)
            {
                handleFatalError(e);
            }
        }

        private void parseCmdlineArgs()
        {
            this.selfTestMode = false;
            this.selfTestTeamId = null;
            string[] args = Environment.GetCommandLineArgs();
            foreach (String a in args)
            {
                String s = a.ToUpperInvariant();
                if (a.IndexOf("-T") == 0) // TEAM ID
                {
                    s = a.Substring(1).ToUpperInvariant();
                    if (Utils.isValidTeamId(s))
                    {
                        Trace.WriteLine("IN TEST MODE. TEST TEAM ID is " + s);
                        this.selfTestMode = true;
                        this.selfTestTeamId = s;
                    }
                }
                else if (s.Equals("-TLDGEN"))
                {
                    Trace.WriteLine("Option - TLDGEN specifed. Going to generate test log data and bail.");
                    this.generateTestLogDataAndExit = true;
                }
            }

        }

        internal void handleFatalError(Exception e)
        {
            Trace.WriteLine("Exiting because of exception" + e);
            MessageBox.Show(this, ErrorReport.getLogAsText() + "\n\nPLEASE CONTACT AN INSTRUCTOR IMMEDIATELY.", "THE ORACLE HAS STOPPED");
            okToClose = true;
            fatalError = true;
        }

        private void initializeOracleLogger()
        {
            String basePath = getDataFileBasePath();
            String logDirName = basePath + "\\" + LOG_DATA_DIRNAME;
            if (!Directory.Exists(logDirName))
            {
                Trace.WriteLine(String.Format("Creating log directory [{0}]", logDirName));
                Directory.CreateDirectory(logDirName);
            }
            oracleLogger = new OracleSubmissionLogger(logDirName, teamInfo.teamId, teamInfo.teamName);
        }

        private void generateTestLogData()
        {
            String basePath = getDataFileBasePath();
            String testLogDirName = basePath + "\\" + TEST_LOG_DATA_DIRNAME;
            if (!Directory.Exists(testLogDirName))
            {
                Trace.WriteLine(String.Format("Creating TEST log directory [{0}]", testLogDirName));
                Directory.CreateDirectory(testLogDirName);
            }
            TestDataGenerator.generateTestLogData(testLogDirName);
            MessageBox.Show(this, ErrorReport.getLogAsText(), "DONE GENERATING TEST DATA.");

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
            this.Resize += Form1_Resize;

            // Add all hideable controls
            this.hideableControls.Add(idPanel);
            this.hideableControls.Add(codePanel);
            this.hideableControls.Add(namePanel);
            this.hideableControls.Add(answerPanel);
            this.hideableControls.Add(oracleButton);
            this.hideableControls.Add(responsePanel);
            this.hideableControls.Add(resetButton);


            // Add top-level positionable controls...
            this.relativePositions.Add(new RelativePosition(idPanel, 0.15));
            this.relativePositions.Add(new RelativePosition(codePanel, 0.20));
            this.relativePositions.Add(new RelativePosition(namePanel, 0.25));
            this.relativePositions.Add(new RelativePosition(answerPanel, 0.37));
            this.relativePositions.Add(new RelativePosition(oracleButton, 0.49));
            this.relativePositions.Add(new RelativePosition(responsePanel, 0.59));
            this.relativePositions.Add(new RelativePosition(resetButton, 0.85));


            // Add all clearable text controls
            this.clearableTextControls.Add(idTextBox);
            this.clearableTextControls.Add(codeTextBox);
            this.clearableTextControls.Add(nameLabel2);
            this.clearableTextControls.Add(answerTextBox);
            this.clearableTextControls.Add(responseRichTextBox);

            color_NotFound = Color.FromName("Orange");
            color_Found = Color.FromName("Green");

            color_CorrectAnswer = Color.FromName("Green");
            color_IncorrectAnswer = Color.FromName("Black");
            color_IncorrectCode = Color.FromName("Red");
            color_DelayedAnswer = Color.FromName("Black");
            color_EditBox = Color.FromName("White");

            myTimer = new System.Windows.Forms.Timer();
            myTimer.Tick += myTimer_Tick;
            myTimer.Interval = IDLE_TIMER_MS;
            uxResetIdleTimer();

        }

        private void KeyEvent(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.F1)
            {
                fullScreen = !fullScreen;
                GoFullscreen(fullScreen);
            }
            else if (e.KeyCode == Keys.Escape)
            {
                if (mode == Mode.modeInit || mode == Mode.modeExit)
                {
                    uxCancelCode();
                }
                else if (mode == Mode.modeOracle)
                {
                    uxSwitchModeToOracle(); // will reset oracle ux
                }

            }

        }


        void myTimer_Tick(object sender, EventArgs e)
        {
            Debug.WriteLine("IDLE TIMER HIT!");

            // Time is only relevant in oracle mode
            if (this.mode == Mode.modeOracle)
            {
                this.idTextBox.Text = "";
                uxClearAndHideSubmission();
            }
            myTimer.Enabled = false;
        }

        private void initializeTeamInfo()
        {
            String basePath = getDataFileBasePath();
            String teamInfoPathName = basePath + "\\" + TEAM_DATA_FILENAME;
            String teamIdPathName = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) + "\\" + TEAM_ID_FILENAME;

            // Load team info
            String teamId = Utils.getCurrentTeamId(teamIdPathName);

            // If in test mode, override the teamID with the one from the cmdline...
            if (this.selfTestMode)
            {
                teamId = this.selfTestTeamId;
            }
            this.teamInfo = Utils.getTeamInfoForMachine(teamInfoPathName, teamId);

            if (teamInfo == null)
            {
                ErrorReport.logError("Could not identify team.");
                teamInfo = new TeamInfo(INVALID_TEAM_ID, INVALID_TEAM_NAME);
            }
        }
        private void initializeOracle()
        {

            String basePath = getDataFileBasePath();
            string pathName = basePath + "\\" + ORACLE_DATA_FILENAME;
            SimpleSpreadsheetReader sr = CsvExcelReader.loadSpreadsheet(pathName);

            //excelReader = TestExcelReader.loadSpreadsheet(pathName, password);
            oracle = new PuzzleOracle(sr);
            if (!oracle.isSourceEncrypted)
            {
                MessageBox.Show(this, "ORACLE DATA FILE IS ***UNENCRYPTED****", "WARNING WARNING WARNING");
            }
            oracle.writeCsvFile(basePath, true);

            // WARNING - writeToFile(false) writes out the decrypted contents!
            // WARNING - do not enable this in the production build!
            // MessageBox.Show(this, "WRITING UNENCRYPTED DATA", "WARNING", MessageBoxButtons.OKCancel);
            //oracle.writeCsvFile(basePath, false);
        }

        private string getDataFileBasePath()
        {

            string basePath = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            string cwd = Environment.CurrentDirectory;
            string driveLetter = Regex.Replace(cwd, ":.*", "");
            if (driveLetter.Length == 1)
            {
                basePath = driveLetter + ":";
            }
            return basePath + "\\" + ORACLE_DATA_DIR;
        }

        private void uxHideAllControls()
        {
            foreach (Control c in hideableControls)
            {
                c.Hide();
            }
        }

        private void uxClearAllTextControls()
        {
            foreach (Control c in clearableTextControls)
            {
                c.Text = "";
            }
        }

        private void uxReset()
        {
            uxHideAllControls();
            uxClearAllTextControls();
        }
        private void uxSwitchModeToInit()
        {
            uxReset();
            titleLabel.Text = teamInfo.teamName;
            uxPositionControl(codePanel, 0.5);
            codePanel.Show();
            codeTextBox.Select();
            mode = Mode.modeInit;
        }

        private void uxSwitchModeToOracle()
        {
            uxReset();
            idPanel.Show();
            idTextBox.Select();
            //uxClearAndHideSubmission();
            mode = Mode.modeOracle;
        }

        private void uxSwitchModeToExit()
        {
            uxReset();
            codeLabel.Text = "Exit code";
            codePanel.Show();
            codeTextBox.Select();
            mode = Mode.modeExit;
        }

        // Vertically positions control (0.0 == top; 1.0 == bottm).
        // Control is horizontally centered.
        private void uxPositionControl(Control c, double fractionFromTop)
        {
            Size curSize = this.Size;
            Trace.WriteLine(curSize);
            int x = (int)(curSize.Width * 0.5 - c.Size.Width / 2.0); // make *center* x at that position.
            int y = (int)(curSize.Height * fractionFromTop - c.Size.Height / 2.0); // make *center* y at that position
            c.Location = new Point(x, y);

        }
        private void textBox_PuzzleId_TextChanged(object sender, EventArgs e)
        {
            Debug.WriteLine("Something was typed! [" + this.idTextBox.Text + "]");
            uxResetIdleTimer();

            // Check that what was typed is a valid puzzle ID...
            String id = this.idTextBox.Text;
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
            this.nameLabel2.Text = "";
            this.namePanel.Hide();
            this.resetButton.Hide();
            uxClearAndHideSubmission();

        }

        private void uxClearAndHideSubmission()
        {
            this.answerTextBox.Text = "";
            //this.textBox_Answer.Hide();
            this.answerPanel.Hide();
            this.oracleButton.Hide();
            this.responseRichTextBox.Text = "";
            this.responsePanel.Hide();
            this.idTextBox.Focus();
        }

        private void uxSetPuzzleFound(string name)
        {
            this.nameLabel2.Text = name;
            this.nameLabel2.ForeColor = this.color_Found;
            this.nameLabel.Show();
            this.namePanel.Show();
            this.resetButton.Show();
            uxEnableAnswer();
        }

        private void uxEnableAnswer()
        {
            this.answerTextBox.Text = "";
            this.answerPanel.Show();
            this.answerTextBox.Focus();
        }

        private void uxSetPuzzleNotFound()
        {
            this.nameLabel2.Text = "No such puzzle.";
            this.nameLabel2.ForeColor = this.color_NotFound;
            this.nameLabel.Hide();
            this.namePanel.Show();
            this.resetButton.Hide();
            uxClearAndHideSubmission();
        }

        private void textBox_Answer_TextChanged(object sender, EventArgs e)
        {
            String text = this.answerTextBox.Text;
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
            this.responsePanel.Hide();
            this.responseRichTextBox.Text = "";
            this.oracleButton.Show();
        }

        private void uxHideSubmission()
        {
            this.oracleButton.Hide();
        }


        private void button1_Click(object sender, EventArgs e)
        {
            Debug.WriteLine("Verify button clicked!");
            uxResetIdleTimer();
            String id = this.idTextBox.Text;
            String answer = this.answerTextBox.Text;

            // Let's ask the oracle!
            if (id.Length > 0)
            {
                PuzzleResponse pr = oracle.checkSolution(id, answer);
                try
                {
                    oracleLogger.logSolveAttempt(id, answer, pr);
                    uxDisplayResponse(pr);
                }
                catch (ApplicationException ex)
                {
                    handleFatalError(ex);
                }
            }
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
            this.responseRichTextBox.ForeColor = c;
            this.responseRichTextBox.Text = pr.response;
            this.oracleButton.Hide();
            this.responsePanel.Show();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            if (fatalError)
            {
                Close();
                return;
            }
            uxSwitchModeToInit();
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

        protected override void OnShown(EventArgs e)
        {
            // At present we don't have anything special to do here... 
            //MessageBox.Show(this, "OnShown");
            uxRepositionAll();
            base.OnShown(e);
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing && !fatalError && !okToClose && !(mode == Mode.modeInit | mode == Mode.modePreInit))
            {
                e.Cancel = true; // we defer closing to when the mode is Mode.modeExit
                if (mode == Mode.modeOracle)
                {
                    uxSwitchModeToExit();
                }
            }
            else
            {
                if (oracleLogger != null)
                {
                    try
                    {
                        oracleLogger.Dispose();
                    }
                    catch (ApplicationException ex)
                    {
                        handleFatalError(ex);
                    }
                    oracleLogger = null;
                }
                base.OnFormClosing(e);
            }
        }

        private void codeTextBox_TextChanged(object sender, EventArgs e)
        {
            Debug.WriteLine("Something was typed! [" + this.codeTextBox.Text + "]");
            if (codeTextBox.BackColor == color_IncorrectCode)
            {
                codeTextBox.BackColor = color_EditBox;
            }

            // Check that what was typed is a valid code.
            String code = this.codeTextBox.Text;
            if (code.Length >= MIN_CODE_LENGTH)
            {
                // For now we have a hardcoded code.
                Boolean validated = code.Equals(INSTRUCTOR_CODE);
                if (validated)
                {
                    if (mode == Mode.modeInit)
                    {
                        uxSwitchModeToOracle();
                    }
                    else if (mode == Mode.modeExit)
                    {
                        Trace.WriteLine("Closing Form!");
                        mode = Mode.modeExit;
                        okToClose = true;
                        this.Close(); // Somethis is not doing the trick!
                        //Application.Exit();
                    }
                }
                else
                {
                    // Incorrect code...
                    codeTextBox.BackColor = color_IncorrectCode;
                }
            }

        }

        private void codeCancelButton_Click(object sender, EventArgs e)
        {
            uxCancelCode();
        }

        private void uxCancelCode()
        {
            if (mode == Mode.modeInit)
            {
                Close();
            }
            else if (mode == Mode.modeExit)
            {
                uxSwitchModeToOracle();
            }
        }

        private void Form1_Resize(object sender, System.EventArgs e)
        {/*
            Control control = (Control)sender;

            // Ensure the Form remains square (Height = Width). 
            if (control.Size.Height != control.Size.Width)
            {
                control.Size = new Size(control.Size.Width, control.Size.Width);
            }
          */
            uxRepositionAll();
        }

        private void uxRepositionAll()
        {
            foreach (var rp in relativePositions)
            {
                uxPositionControl(rp.c, rp.fractionFromTop);
            }
        }



        private void resetButton_Click(object sender, EventArgs e)
        {
            if (mode == Mode.modeOracle)
            {
                uxSwitchModeToOracle(); // will reset oracle ux
            }
        }
    }
}
