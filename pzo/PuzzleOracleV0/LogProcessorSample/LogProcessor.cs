using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace LogProcessorSample
{
    class LogEventArgs : EventArgs
    {
        public String transactionId;
        public String timestamp;
        public String teamId;
        public String puzzleId;
        public String status;
        public String extraText;
    }
    class LogProcessor : IDisposable
    {
        private string logDirectory;
        FileSystemWatcher watcher;
        List<EventHandler<LogEventArgs>> ehList;
        bool active = false;

        public LogProcessor(string logDirectory)
        {
            ehList = new List<EventHandler<LogEventArgs>>();
            // TODO: Complete member initialization
            this.logDirectory = logDirectory;
            watcher = new FileSystemWatcher();
            watcher.Path = logDirectory;
            /* Watch for changes in LastAccess and LastWrite times, and
               the renaming of files or directories. */
            watcher.NotifyFilter = NotifyFilters.FileName; //| NotifyFilters.DirectoryName;
            // Only watch text files.
            watcher.Filter = "*.csv";

            // Add event handlers.
            watcher.Created += new FileSystemEventHandler(OnChanged);
            //watcher.Deleted += new FileSystemEventHandler(OnChanged);
            //watcher.Renamed += new RenamedEventHandler(OnRenamed);



        }
        // Define the event handlers.
        private void OnChanged(object source, FileSystemEventArgs e)
        {
            if (!active)
            {
                return;
            }
            Console.WriteLine("File: " + e.FullPath + " " + e.ChangeType);
            // TODO - read all the file content and call the handler.
            foreach (var eh in ehList)
            {
                //
            }
        }

        internal void registerEventHandler(EventHandler<LogEventArgs> eh)
        {
            ehList.Add(eh);
        }

        internal void start()
        {
            // Begin watching.
            watcher.EnableRaisingEvents = true;
            active = true;
        }

        internal void stop()
        {
            active = false;
            // Stop watching.
            watcher.EnableRaisingEvents = false;
            throw new NotImplementedException();
        }

        void IDisposable.Dispose()
        {
            watcher.EnableRaisingEvents = false;
        }
    }
}
