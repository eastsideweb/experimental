namespace PuzzleOracleV0
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.answerTextBox = new System.Windows.Forms.TextBox();
            this.answerLabel = new System.Windows.Forms.Label();
            this.responseRichTextBox = new System.Windows.Forms.RichTextBox();
            this.nameLabel = new System.Windows.Forms.Label();
            this.oracleButton = new System.Windows.Forms.Button();
            this.nameLabel2 = new System.Windows.Forms.Label();
            this.idPanel = new System.Windows.Forms.Panel();
            this.idLabel = new System.Windows.Forms.Label();
            this.idTextBox = new System.Windows.Forms.TextBox();
            this.answerPanel = new System.Windows.Forms.Panel();
            this.namePanel = new System.Windows.Forms.Panel();
            this.responseLabel = new System.Windows.Forms.Label();
            this.titleLabel = new System.Windows.Forms.Label();
            this.responsePanel = new System.Windows.Forms.Panel();
            this.codePanel = new System.Windows.Forms.Panel();
            this.codeCancelButton = new System.Windows.Forms.Button();
            this.codeLabel = new System.Windows.Forms.Label();
            this.codeTextBox = new System.Windows.Forms.TextBox();
            this.idPanel.SuspendLayout();
            this.answerPanel.SuspendLayout();
            this.namePanel.SuspendLayout();
            this.responsePanel.SuspendLayout();
            this.codePanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // answerTextBox
            // 
            this.answerTextBox.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.answerTextBox.Font = new System.Drawing.Font("Lucida Console", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.answerTextBox.Location = new System.Drawing.Point(12, 41);
            this.answerTextBox.Name = "answerTextBox";
            this.answerTextBox.Size = new System.Drawing.Size(406, 30);
            this.answerTextBox.TabIndex = 2;
            this.answerTextBox.TextChanged += new System.EventHandler(this.textBox_Answer_TextChanged);
            // 
            // answerLabel
            // 
            this.answerLabel.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.answerLabel.AutoSize = true;
            this.answerLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.answerLabel.Location = new System.Drawing.Point(148, 9);
            this.answerLabel.Name = "answerLabel";
            this.answerLabel.Size = new System.Drawing.Size(150, 29);
            this.answerLabel.TabIndex = 5;
            this.answerLabel.Text = "Your Answer";
            // 
            // responseRichTextBox
            // 
            this.responseRichTextBox.BackColor = System.Drawing.Color.LightGray;
            this.responseRichTextBox.Font = new System.Drawing.Font("Cooper Black", 16F);
            this.responseRichTextBox.Location = new System.Drawing.Point(28, 44);
            this.responseRichTextBox.Name = "responseRichTextBox";
            this.responseRichTextBox.ReadOnly = true;
            this.responseRichTextBox.Size = new System.Drawing.Size(689, 207);
            this.responseRichTextBox.TabIndex = 6;
            this.responseRichTextBox.TabStop = false;
            this.responseRichTextBox.Text = "Sample oracle text";
            // 
            // nameLabel
            // 
            this.nameLabel.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.nameLabel.AutoSize = true;
            this.nameLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.nameLabel.Location = new System.Drawing.Point(150, 17);
            this.nameLabel.Name = "nameLabel";
            this.nameLabel.Size = new System.Drawing.Size(155, 29);
            this.nameLabel.TabIndex = 7;
            this.nameLabel.Text = "Puzzle Name";
            // 
            // oracleButton
            // 
            this.oracleButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.oracleButton.BackColor = System.Drawing.SystemColors.Control;
            this.oracleButton.FlatStyle = System.Windows.Forms.FlatStyle.Popup;
            this.oracleButton.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.oracleButton.Location = new System.Drawing.Point(389, 349);
            this.oracleButton.Name = "oracleButton";
            this.oracleButton.Size = new System.Drawing.Size(226, 38);
            this.oracleButton.TabIndex = 8;
            this.oracleButton.Text = "Ask the oracle";
            this.oracleButton.UseVisualStyleBackColor = false;
            this.oracleButton.Click += new System.EventHandler(this.button1_Click);
            // 
            // nameLabel2
            // 
            this.nameLabel2.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.nameLabel2.AutoSize = true;
            this.nameLabel2.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.nameLabel2.Location = new System.Drawing.Point(24, 46);
            this.nameLabel2.Name = "nameLabel2";
            this.nameLabel2.Size = new System.Drawing.Size(384, 32);
            this.nameLabel2.TabIndex = 9;
            this.nameLabel2.Text = "-----------------------------------------";
            this.nameLabel2.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            // 
            // idPanel
            // 
            this.idPanel.BackColor = System.Drawing.Color.Transparent;
            this.idPanel.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None;
            this.idPanel.Controls.Add(this.idLabel);
            this.idPanel.Controls.Add(this.idTextBox);
            this.idPanel.Location = new System.Drawing.Point(386, 73);
            this.idPanel.Name = "idPanel";
            this.idPanel.Size = new System.Drawing.Size(232, 79);
            this.idPanel.TabIndex = 10;
            // 
            // idLabel
            // 
            this.idLabel.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.idLabel.AutoSize = true;
            this.idLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.idLabel.Location = new System.Drawing.Point(27, 8);
            this.idLabel.Name = "idLabel";
            this.idLabel.Size = new System.Drawing.Size(177, 29);
            this.idLabel.TabIndex = 6;
            this.idLabel.Text = "Puzzle Number";
            // 
            // idTextBox
            // 
            this.idTextBox.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.idTextBox.Font = new System.Drawing.Font("Lucida Console", 16.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.idTextBox.Location = new System.Drawing.Point(88, 41);
            this.idTextBox.Name = "idTextBox";
            this.idTextBox.Size = new System.Drawing.Size(62, 34);
            this.idTextBox.TabIndex = 5;
            this.idTextBox.Text = "888";
            this.idTextBox.TextChanged += new System.EventHandler(this.textBox_PuzzleId_TextChanged);
            // 
            // answerPanel
            // 
            this.answerPanel.BackColor = System.Drawing.Color.Transparent;
            this.answerPanel.Controls.Add(this.answerTextBox);
            this.answerPanel.Controls.Add(this.answerLabel);
            this.answerPanel.Location = new System.Drawing.Point(285, 260);
            this.answerPanel.Name = "answerPanel";
            this.answerPanel.Size = new System.Drawing.Size(435, 79);
            this.answerPanel.TabIndex = 11;
            this.answerPanel.Visible = false;
            // 
            // namePanel
            // 
            this.namePanel.BackColor = System.Drawing.Color.Transparent;
            this.namePanel.Controls.Add(this.nameLabel2);
            this.namePanel.Controls.Add(this.nameLabel);
            this.namePanel.Location = new System.Drawing.Point(285, 162);
            this.namePanel.Name = "namePanel";
            this.namePanel.Size = new System.Drawing.Size(435, 88);
            this.namePanel.TabIndex = 12;
            this.namePanel.Visible = false;
            // 
            // responseLabel
            // 
            this.responseLabel.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.responseLabel.AutoSize = true;
            this.responseLabel.BackColor = System.Drawing.Color.Transparent;
            this.responseLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.responseLabel.Location = new System.Drawing.Point(248, 8);
            this.responseLabel.Name = "responseLabel";
            this.responseLabel.Size = new System.Drawing.Size(254, 29);
            this.responseLabel.TabIndex = 7;
            this.responseLabel.Text = "The oracle responds...";
            // 
            // titleLabel
            // 
            this.titleLabel.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.titleLabel.AutoSize = true;
            this.titleLabel.BackColor = System.Drawing.Color.Transparent;
            this.titleLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.titleLabel.Location = new System.Drawing.Point(355, 31);
            this.titleLabel.Name = "titleLabel";
            this.titleLabel.Size = new System.Drawing.Size(287, 32);
            this.titleLabel.TabIndex = 14;
            this.titleLabel.Text = "Team: UNASSIGNED";
            // 
            // responsePanel
            // 
            this.responsePanel.BackColor = System.Drawing.Color.Transparent;
            this.responsePanel.Controls.Add(this.responseRichTextBox);
            this.responsePanel.Controls.Add(this.responseLabel);
            this.responsePanel.Location = new System.Drawing.Point(129, 397);
            this.responsePanel.Name = "responsePanel";
            this.responsePanel.Size = new System.Drawing.Size(746, 254);
            this.responsePanel.TabIndex = 15;
            // 
            // codePanel
            // 
            this.codePanel.BackColor = System.Drawing.Color.Transparent;
            this.codePanel.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None;
            this.codePanel.Controls.Add(this.codeCancelButton);
            this.codePanel.Controls.Add(this.codeLabel);
            this.codePanel.Controls.Add(this.codeTextBox);
            this.codePanel.Location = new System.Drawing.Point(643, 73);
            this.codePanel.Name = "codePanel";
            this.codePanel.Size = new System.Drawing.Size(232, 140);
            this.codePanel.TabIndex = 11;
            // 
            // codeCancelButton
            // 
            this.codeCancelButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.codeCancelButton.BackColor = System.Drawing.SystemColors.Control;
            this.codeCancelButton.FlatStyle = System.Windows.Forms.FlatStyle.Popup;
            this.codeCancelButton.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.codeCancelButton.Location = new System.Drawing.Point(17, 84);
            this.codeCancelButton.Name = "codeCancelButton";
            this.codeCancelButton.Size = new System.Drawing.Size(197, 38);
            this.codeCancelButton.TabIndex = 16;
            this.codeCancelButton.Text = "Cancel";
            this.codeCancelButton.UseVisualStyleBackColor = false;
            this.codeCancelButton.Click += new System.EventHandler(this.codeCancelButton_Click);
            // 
            // codeLabel
            // 
            this.codeLabel.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.codeLabel.AutoSize = true;
            this.codeLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.codeLabel.Location = new System.Drawing.Point(58, 8);
            this.codeLabel.Name = "codeLabel";
            this.codeLabel.Size = new System.Drawing.Size(127, 29);
            this.codeLabel.TabIndex = 6;
            this.codeLabel.Text = "Start Code";
            // 
            // codeTextBox
            // 
            this.codeTextBox.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.codeTextBox.Font = new System.Drawing.Font("Lucida Console", 16.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.codeTextBox.Location = new System.Drawing.Point(71, 44);
            this.codeTextBox.Name = "codeTextBox";
            this.codeTextBox.Size = new System.Drawing.Size(104, 34);
            this.codeTextBox.TabIndex = 5;
            this.codeTextBox.Text = "ABCDE";
            this.codeTextBox.UseSystemPasswordChar = true;
            this.codeTextBox.TextChanged += new System.EventHandler(this.codeTextBox_TextChanged);
            // 
            // Form1
            // 
            this.AcceptButton = this.oracleButton;
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackgroundImage = global::PuzzleOracleV0.Properties.Resources.c_curve2;
            this.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.ClientSize = new System.Drawing.Size(998, 663);
            this.Controls.Add(this.codePanel);
            this.Controls.Add(this.oracleButton);
            this.Controls.Add(this.titleLabel);
            this.Controls.Add(this.namePanel);
            this.Controls.Add(this.answerPanel);
            this.Controls.Add(this.idPanel);
            this.Controls.Add(this.responsePanel);
            this.DoubleBuffered = true;
            this.Name = "Form1";
            this.Text = "Puzzle Oracle";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.idPanel.ResumeLayout(false);
            this.idPanel.PerformLayout();
            this.answerPanel.ResumeLayout(false);
            this.answerPanel.PerformLayout();
            this.namePanel.ResumeLayout(false);
            this.namePanel.PerformLayout();
            this.responsePanel.ResumeLayout(false);
            this.responsePanel.PerformLayout();
            this.codePanel.ResumeLayout(false);
            this.codePanel.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox answerTextBox;
        private System.Windows.Forms.Label answerLabel;
        private System.Windows.Forms.RichTextBox responseRichTextBox;
        private System.Windows.Forms.Label nameLabel;
        private System.Windows.Forms.Button oracleButton;
        private System.Windows.Forms.Label nameLabel2;
        private System.Windows.Forms.Panel idPanel;
        private System.Windows.Forms.Label idLabel;
        private System.Windows.Forms.TextBox idTextBox;
        private System.Windows.Forms.Panel answerPanel;
        private System.Windows.Forms.Panel namePanel;
        private System.Windows.Forms.Label responseLabel;
        private System.Windows.Forms.Label titleLabel;
        private System.Windows.Forms.Panel responsePanel;
        private System.Windows.Forms.Panel codePanel;
        private System.Windows.Forms.Label codeLabel;
        private System.Windows.Forms.TextBox codeTextBox;
        private System.Windows.Forms.Button codeCancelButton;
    }
}

