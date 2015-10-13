using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace LogProcessorSample
{
    /// <summary>
    /// The file copier processes new thumb drives as they show up - it checks that these drives contain valid logs 
    /// and then copies these over to the staging directory, verifies the integrity of the copy, and then moves the 
    /// logs in the thumb drive under a "archived" sub-dir in the thumb drive. Finally it moves the files in the
    /// staging directory to the "new" directory (where it will be processed by the log processor).
    /// </summary>
    class FileCopier
    {
        const string MODULE = "FC: ";
        const string ARCHIVED = "archived";
        const string NEW = "new";
        const string STAGING = "staging";

        public readonly String stagingDir;
        public readonly String newDir;

        public FileCopier(String baseWorkingDir)
        {
            stagingDir = baseWorkingDir + "\\" + STAGING;
            newDir = baseWorkingDir + "\\" + NEW;
            // If new and staging directories do not exist, create them. (true == critical, i.e., exit program if unsuccessful)
            Utils.createDirIfNeeded(stagingDir, true);
            Utils.createDirIfNeeded(newDir, true);

        }
        public void newDriveHandler(object sender, EventArgs e)
        {
            NewDriveNotifierEventArgs nde = (NewDriveNotifierEventArgs)e;
            MyConsole.WriteLine(String.Format("Processing new drive [{0}].", nde.driveName));
        }

    }
}
