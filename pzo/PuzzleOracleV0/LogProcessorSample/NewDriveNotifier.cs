using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.IO;

namespace LogProcessorSample
{
    class NewDriveNotifierEventArgs : EventArgs
    {
        public String driveName;

        public NewDriveNotifierEventArgs(String dn)
        {
            // TODO: Complete member initialization
            this.driveName = dn; // hmm.. can't make copy of di, so don't know if it's valid.
        }
    }

    class NewDriveNotifier : IDisposable
    {
        class NameVolumePair
        {
            public String name;
            public String volume;
            public NameVolumePair(String n, String v)
            {
                name = n;
                volume = v;
            }
        }

        Boolean listening = false;
        Timer t;
        EventHandler<NewDriveNotifierEventArgs> eh;
        NameVolumePair[] prevDriveArray = new NameVolumePair[0];


        public NewDriveNotifier(EventHandler<NewDriveNotifierEventArgs> eh)
        {

            this.eh = eh;
            t = new Timer(2000);
            // Hook up the Elapsed event for the timer. 
            t.Elapsed += (o, e) => { this.handleTimer(); };
            t.AutoReset = false;
            t.Enabled = false;

        }

        public void startListening()
        {
            //t.Start();
            t.Enabled = true;
            listening = true;
        }
        public void stopListening()
        {
            t.Enabled = false;
            listening = false;
        }

        void handleTimer()
        {
            //Console.WriteLine("NDN: In timer handler.");
            DriveInfo[] newDriveArray = DriveInfo.GetDrives();
            // Check if any of the *removable* drives are new since last time.
            List<DriveInfo> newDrives = new List<DriveInfo>();
            List<NameVolumePair> updatedList = new List<NameVolumePair>();
            foreach (var di in newDriveArray)
            {
                if (di.DriveType == DriveType.Removable && di.IsReady)
                {
                    updatedList.Add(new NameVolumePair(di.Name, di.VolumeLabel));
                    Boolean found = false;
                    foreach (var dj in prevDriveArray)
                    {
                        if (isSameDrive(di, dj))
                        {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                    {
                        Console.WriteLine(String.Format("NDN: Found new drive [{0}]", di.Name));
                        newDrives.Add(di);
                    }
                }
            }

            // Update removable drive list...
            this.prevDriveArray = updatedList.ToArray();

            // Notify handler of new drives...
            foreach (var di in newDrives)
            {
                if (!listening)
                {
                    break;
                }
                eh(this, new NewDriveNotifierEventArgs(di.Name));
            }

            if (listening)
            {
                t.Enabled = true;
            }
        }

        private bool isSameDrive(DriveInfo di, NameVolumePair nvp)
        {
            return di.Name.Equals(nvp.name) && di.VolumeLabel.Equals(nvp.volume);
        }

        void IDisposable.Dispose()
        {
            t.Enabled = false;
            t.Dispose();
        }
    }
}