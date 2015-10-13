using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        public FileCopier(String baseWorkingDir)
        {

        }
        public void newDriveHandler(object sender, EventArgs e)
        {
            NewDriveNotifierEventArgs nde = (NewDriveNotifierEventArgs)e;
        }

    }
}
