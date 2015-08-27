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
            this.textBox_PuzzleNumber = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.textBox_Answer = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.richTextBox_Response = new System.Windows.Forms.RichTextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            this.label_PuzzleName = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // textBox_PuzzleNumber
            // 
            this.textBox_PuzzleNumber.Font = new System.Drawing.Font("Lucida Console", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.textBox_PuzzleNumber.Location = new System.Drawing.Point(24, 73);
            this.textBox_PuzzleNumber.Name = "textBox_PuzzleNumber";
            this.textBox_PuzzleNumber.Size = new System.Drawing.Size(44, 27);
            this.textBox_PuzzleNumber.TabIndex = 0;
            this.textBox_PuzzleNumber.Text = "123";
            this.textBox_PuzzleNumber.TextChanged += new System.EventHandler(this.textBox_PuzzleNumber_TextChanged);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(21, 98);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(182, 17);
            this.label1.TabIndex = 1;
            this.label1.Text = "Enter 3-digit puzzle number";
            // 
            // textBox_Answer
            // 
            this.textBox_Answer.Font = new System.Drawing.Font("Lucida Console", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.textBox_Answer.Location = new System.Drawing.Point(28, 168);
            this.textBox_Answer.Name = "textBox_Answer";
            this.textBox_Answer.Size = new System.Drawing.Size(406, 24);
            this.textBox_Answer.TabIndex = 2;
            this.textBox_Answer.TextChanged += new System.EventHandler(this.textBox_Answer_TextChanged);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(25, 193);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(194, 17);
            this.label2.TabIndex = 3;
            this.label2.Text = "Enter solution word or phrase";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.label3.Location = new System.Drawing.Point(24, 50);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(124, 20);
            this.label3.TabIndex = 4;
            this.label3.Text = "Puzzle Number";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.label4.Location = new System.Drawing.Point(28, 145);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(104, 20);
            this.label4.TabIndex = 5;
            this.label4.Text = "Your Answer";
            // 
            // richTextBox_Response
            // 
            this.richTextBox_Response.Location = new System.Drawing.Point(12, 304);
            this.richTextBox_Response.Name = "richTextBox_Response";
            this.richTextBox_Response.ReadOnly = true;
            this.richTextBox_Response.Size = new System.Drawing.Size(422, 245);
            this.richTextBox_Response.TabIndex = 6;
            this.richTextBox_Response.TabStop = false;
            this.richTextBox_Response.Text = "";
            this.richTextBox_Response.TextChanged += new System.EventHandler(this.richTextBox_Response_TextChanged);
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Font = new System.Drawing.Font("Microsoft Sans Serif", 10F);
            this.label5.Location = new System.Drawing.Point(216, 50);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(109, 20);
            this.label5.TabIndex = 7;
            this.label5.Text = "Puzzle Name";
            this.label5.Click += new System.EventHandler(this.label5_Click);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(28, 244);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(120, 30);
            this.button1.TabIndex = 8;
            this.button1.Text = "Verify";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // label_PuzzleName
            // 
            this.label_PuzzleName.AutoSize = true;
            this.label_PuzzleName.Location = new System.Drawing.Point(220, 73);
            this.label_PuzzleName.Name = "label_PuzzleName";
            this.label_PuzzleName.Size = new System.Drawing.Size(120, 17);
            this.label_PuzzleName.TabIndex = 9;
            this.label_PuzzleName.Text = "label6 adasdfasdf";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(459, 561);
            this.Controls.Add(this.label_PuzzleName);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.richTextBox_Response);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.textBox_Answer);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.textBox_PuzzleNumber);
            this.Name = "Form1";
            this.Text = "Puzzle Oracle";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox textBox_PuzzleNumber;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox textBox_Answer;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.RichTextBox richTextBox_Response;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Label label_PuzzleName;
    }
}

