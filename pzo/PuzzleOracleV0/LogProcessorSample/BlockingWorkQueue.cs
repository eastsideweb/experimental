using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Diagnostics;

namespace LogProcessorSample
{
    /// <summary>
    /// The blocking work queue implements a blocking work queue - multiple threads can queue work requests, but only
    /// one thread (typically the main thread) calls the "process()" method that blocks until all work is done. 
    /// </summary>
    class BlockingWorkQueue
    {
        const string MODULE = "BWQ: ";
        class WorkItem
        {
            public WorkItem(object source, EventArgs ea, EventHandler eh)
            {
                this.source = source;
                this.ea = ea;
                this.eh = eh;
            }
            public object source;
            public EventArgs ea;
            public EventHandler eh;
        }

        Queue<WorkItem> q = new Queue<WorkItem>();
        // EventHandler eh = new EventHandler()
        Boolean stop = false;

        public void enque(Object source, EventArgs ea, EventHandler eh)
        {
            lock (q)
            {
                q.Enqueue(new WorkItem(source, ea, eh));
                Monitor.Pulse(q);
            }
        }

        public void process()
        {
            Boolean quitLoopWhenQueueEmpty = false;
            while (!quitLoopWhenQueueEmpty)
            {
                WorkItem wi = null;
                lock (q)
                {
                    if (q.Count == 0)
                    {
                        if (this.stop == true)
                        {
                            quitLoopWhenQueueEmpty = true;
                        }
                        else
                        {
                            Trace.WriteLine(MODULE + "Waiting for work item...");
                            Monitor.Wait(q);
                        }
                    }

                    Debug.Assert(q.Count > 0 || stop);
                    if (q.Count > 0)
                    {
                        wi = q.Dequeue();
                    }
                }
                if (wi != null)
                {
                    Trace.WriteLine(MODULE + "Going to start a work item.");
                    wi.eh(wi.source, wi.ea);
                    Trace.WriteLine(MODULE + "Done with work item.");
                }
            }
            Trace.WriteLine(MODULE + "Exiting wait loop.");
        }

        public void stopWaiting()
        {
            Trace.WriteLine(MODULE + "stopWaiting() called");
            stop = true;
            lock (q)
            {
                Monitor.Pulse(q);
            }
        }
    }
}
