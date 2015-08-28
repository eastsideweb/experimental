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
            this.textBox_Answer = new System.Windows.Forms.TextBox();
            this.label4 = new System.Windows.Forms.Label();
            this.richTextBox_Response = new System.Windows.Forms.RichTextBox();
            this.label_Name = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            this.label_PuzzleName = new System.Windows.Forms.Label();
            this.panel_Number = new System.Windows.Forms.Panel();
            this.label3 = new System.Windows.Forms.Label();
            this.textBox_PuzzleId = new System.Windows.Forms.TextBox();
            this.panel_Answer = new System.Windows.Forms.Panel();
            this.panel_Name = new System.Windows.Forms.Panel();
            this.panel_Response = new System.Windows.Forms.Panel();
            this.label1 = new System.Windows.Forms.Label();
            this.panel_Number.SuspendLayout();
            this.panel_Answer.SuspendLayout();
            this.panel_Name.SuspendLayout();
            this.panel_Response.SuspendLayout();
            this.SuspendLayout();
            // 
            // textBox_Answer
            // 
            this.textBox_Answer.Font = new System.Drawing.Font("Lucida Console", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.textBox_Answer.Location = new System.Drawing.Point(14, 42);
            this.textBox_Answer.Name = "textBox_Answer";
            this.textBox_Answer.Size = new System.Drawing.Size(406, 24);
            this.textBox_Answer.TabIndex = 2;
            this.textBox_Answer.TextChanged += new System.EventHandler(this.textBox_Answer_TextChanged);
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.label4.Location = new System.Drawing.Point(165, 19);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(104, 20);
            this.label4.TabIndex = 5;
            this.label4.Text = "Your Answer";
            // 
            // richTextBox_Response
            // 
            this.richTextBox_Response.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.richTextBox_Response.Font = new System.Drawing.Font("Cooper Black", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.richTextBox_Response.Location = new System.Drawing.Point(17, 43);
            this.richTextBox_Response.Name = "richTextBox_Response";
            this.richTextBox_Response.ReadOnly = true;
            this.richTextBox_Response.Size = new System.Drawing.Size(422, 111);
            this.richTextBox_Response.TabIndex = 6;
            this.richTextBox_Response.TabStop = false;
            this.richTextBox_Response.Text = "";
            // 
            // label_Name
            // 
            this.label_Name.AutoSize = true;
            this.label_Name.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.label_Name.Location = new System.Drawing.Point(70, 15);
            this.label_Name.Name = "label_Name";
            this.label_Name.Size = new System.Drawing.Size(109, 20);
            this.label_Name.TabIndex = 7;
            this.label_Name.Text = "Puzzle Name";
            // 
            // button1
            // 
            this.button1.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.button1.Location = new System.Drawing.Point(148, 297);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(162, 30);
            this.button1.TabIndex = 8;
            this.button1.Text = "Ask the oracle";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Visible = false;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // label_PuzzleName
            // 
            this.label_PuzzleName.AutoSize = true;
            this.label_PuzzleName.Font = new System.Drawing.Font("Microsoft Sans Serif", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label_PuzzleName.Location = new System.Drawing.Point(70, 44);
            this.label_PuzzleName.Name = "label_PuzzleName";
            this.label_PuzzleName.Size = new System.Drawing.Size(105, 20);
            this.label_PuzzleName.TabIndex = 9;
            this.label_PuzzleName.Text = "----------------";
            this.label_PuzzleName.TextAlign = System.Drawing.ContentAlignment.TopCenter;
            // 
            // panel_Number
            // 
            this.panel_Number.Controls.Add(this.label3);
            this.panel_Number.Controls.Add(this.textBox_PuzzleId);
            this.panel_Number.Location = new System.Drawing.Point(113, 11);
            this.panel_Number.Name = "panel_Number";
            this.panel_Number.Size = new System.Drawing.Size(232, 79);
            this.panel_Number.TabIndex = 10;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.label3.Location = new System.Drawing.Point(54, 18);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(124, 20);
            this.label3.TabIndex = 6;
            this.label3.Text = "Puzzle Number";
            // 
            // textBox_PuzzleId
            // 
            this.textBox_PuzzleId.Font = new System.Drawing.Font("Lucida Console", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.textBox_PuzzleId.Location = new System.Drawing.Point(92, 41);
            this.textBox_PuzzleId.Name = "textBox_PuzzleId";
            this.textBox_PuzzleId.Size = new System.Drawing.Size(49, 27);
            this.textBox_PuzzleId.TabIndex = 5;
            this.textBox_PuzzleId.TextChanged += new System.EventHandler(this.textBox_PuzzleId_TextChanged);
            // 
            // panel_Answer
            // 
            this.panel_Answer.Controls.Add(this.textBox_Answer);
            this.panel_Answer.Controls.Add(this.label4);
            this.panel_Answer.Location = new System.Drawing.Point(12, 212);
            this.panel_Answer.Name = "panel_Answer";
            this.panel_Answer.Size = new System.Drawing.Size(435, 79);
            this.panel_Answer.TabIndex = 11;
            this.panel_Answer.Visible = false;
            // 
            // panel_Name
            // 
            this.panel_Name.Controls.Add(this.label_PuzzleName);
            this.panel_Name.Controls.Add(this.label_Name);
            this.panel_Name.Location = new System.Drawing.Point(105, 117);
            this.panel_Name.Name = "panel_Name";
            this.panel_Name.Size = new System.Drawing.Size(248, 78);
            this.panel_Name.TabIndex = 12;
            this.panel_Name.Visible = false;
            // 
            // panel_Response
            // 
            this.panel_Response.Controls.Add(this.label1);
            this.panel_Response.Controls.Add(this.richTextBox_Response);
            this.panel_Response.Location = new System.Drawing.Point(-1, 298);
            this.panel_Response.Name = "panel_Response";
            this.panel_Response.Size = new System.Drawing.Size(457, 227);
            this.panel_Response.TabIndex = 13;
            this.panel_Response.Visible = false;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.label1.Location = new System.Drawing.Point(141, 13);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(174, 20);
            this.label1.TabIndex = 7;
            this.label1.Text = "The oracle responds...";
            // 
            // Form1
            // 
            this.AcceptButton = this.button1;
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(459, 561);
            this.Controls.Add(this.panel_Response);
            this.Controls.Add(this.panel_Name);
            this.Controls.Add(this.panel_Answer);
            this.Controls.Add(this.panel_Number);
            this.Controls.Add(this.button1);
            this.Name = "Form1";
            this.Text = "Puzzle Oracle";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.panel_Number.ResumeLayout(false);
            this.panel_Number.PerformLayout();
            this.panel_Answer.ResumeLayout(false);
            this.panel_Answer.PerformLayout();
            this.panel_Name.ResumeLayout(false);
            this.panel_Name.PerformLayout();
            this.panel_Response.ResumeLayout(false);
            this.panel_Response.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TextBox textBox_Answer;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.RichTextBox richTextBox_Response;
        private System.Windows.Forms.Label label_Name;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Label label_PuzzleName;
        private System.Windows.Forms.Panel panel_Number;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox textBox_PuzzleId;
        private System.Windows.Forms.Panel panel_Answer;
        private System.Windows.Forms.Panel panel_Name;
        private System.Windows.Forms.Panel panel_Response;
        private System.Windows.Forms.Label label1;
    }
}

