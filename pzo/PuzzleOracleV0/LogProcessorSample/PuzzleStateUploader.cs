using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Diagnostics;

namespace LogProcessorSample
{
    class PuzzleStateUploader
    {
        struct Token
        {
            public String token;
        }

        public class PZAuthentication
        {
            public String username { get; set; }
            public String password { get; set; }
            public String roleType { get; set; }

            public PZAuthentication(String username, String password, String roleType)
            {
                this.username = username;
                this.password = password;
                this.roleType = roleType;
            }
        }

        const String MODULE = "UPLOADER: "; // for debug log.
        const String sessionUrlFormat = "series/{0}/session";
        const String releaseSessionUrlFormat = "/series/{0}/session/{1}";
        const String updatePuzzleStatusUrlFormat = "events/{0}/teams/{1}/puzzleStates/{2}";
        private String baseUrl;
        private HttpClient client;
        private PZAuthentication pzAuthorization;
        private String seriesId;
        private String sessionToken;
        private bool sessionStarted;

        public PuzzleStateUploader(String baseUrl)
        {
            this.baseUrl = baseUrl;
            this.InitClient();
        }

        ~PuzzleStateUploader()
        {
            this.releaseSession();
        }
        private void InitClient()
        {
            client = new HttpClient();
            client.BaseAddress = new Uri(this.baseUrl);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        }
        public bool startSession(String seriesId, PZAuthentication auth)
        {
            try
            {
                this.startSessionAsync(seriesId, auth).Wait();
                return this.sessionToken != null;
            }
            catch (AggregateException ex)
            {
                Trace.TraceError(MODULE + "startSession failed for series " + seriesId + "with " + ex.Message);
                this.sessionToken = null;
                this.seriesId = null;
                Trace.Flush();
                return false;
            }
        }
        private async Task startSessionAsync(String seriesId, PZAuthentication auth)
        {
            // Make sure no other session is underway -if so, we will continue to use it
            if (this.sessionToken != null && this.seriesId == seriesId && auth == this.pzAuthorization)
            {
                return;
            }
            else
            {
                this.releaseSession().Wait();

            }
            Debug.Assert(this.sessionToken == null);
            this.sessionToken = null;
            this.seriesId = seriesId;
            String sessionUrl = String.Format(sessionUrlFormat, seriesId);
            this.pzAuthorization = auth;

            HttpResponseMessage tokenResponse = await client.PostAsJsonAsync(sessionUrl, this.pzAuthorization);
            if (tokenResponse.IsSuccessStatusCode)
            {
                Token token = await tokenResponse.Content.ReadAsAsync<Token>();
                this.sessionToken = token.token;
                client.DefaultRequestHeaders.Add("token", sessionToken);
                Console.WriteLine("Token: " + this.sessionToken);
                sessionStarted = true;
            }
            else
            {
                this.sessionToken = null;
                this.seriesId = null;
                Trace.TraceError(MODULE + " startSession failed for series " + seriesId + "with " + tokenResponse.ReasonPhrase + "(" + tokenResponse.StatusCode + ")");
                MyConsole.WriteError(MODULE + "startSession failed for series " + seriesId + ".\nPress ENTER to quit.");
                Trace.Flush();
                //Console.ReadLine();
                return;
            }

        }

        public async Task releaseSession()
        {
            if (this.sessionToken != null && this.seriesId != null)
            {
                String deleteUrl = String.Format(releaseSessionUrlFormat, this.seriesId, this.sessionToken);
                HttpResponseMessage releaseResponse = await client.DeleteAsync(deleteUrl);
                if (releaseResponse.IsSuccessStatusCode)
                {
                    this.sessionToken = null;
                    this.seriesId = null;
                }
                else
                {
                    Trace.TraceError(MODULE + "releaseSession failed for series " + this.seriesId + " and token: " + this.sessionToken + "with " + releaseResponse.ReasonPhrase);
                    MyConsole.WriteWarning(MODULE + "releaseSession failed for series " + this.seriesId);
                    Trace.Flush();
                    this.sessionToken = null;
                    this.seriesId = null;
                }
            }
        }

        public bool updatePuzzleState (String eventId, String teamId, String puzzleId, LogEntry le)
        {
            if (!sessionStarted)
            {
                return false;
            }

            try
            {
                this.updatePuzzleStateAsync(eventId, teamId, puzzleId, le).Wait();
                return true;
            }
            catch (AggregateException ex)
            {
                MyConsole.WriteError(MODULE + "update failed");
                Trace.TraceError(MODULE + "update failed for team: " + teamId + "and puzzle: " + puzzleId + " with " + ex.Message);
                return false;
            }
        }
        private async Task updatePuzzleStateAsync(String eventId, String teamId, String puzzleId, LogEntry le)
        {
            Debug.Assert(sessionStarted);
            IEnumerable<String> headerValues = null;
            client.DefaultRequestHeaders.TryGetValues("token", out headerValues);
            String updateUrl = String.Format(updatePuzzleStatusUrlFormat, eventId, teamId, puzzleId);
            HttpResponseMessage updateResponse = await client.PutAsJsonAsync(updateUrl, le);
            if (!updateResponse.IsSuccessStatusCode)
            {
                if (updateResponse.StatusCode == System.Net.HttpStatusCode.InternalServerError)
                {
                    throw new AggregateException("InternalServerError");
                }
            }
        }
    }
}
