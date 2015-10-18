using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json;

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

        const String sessionUrlFormat = "series/{0}/session";
        const String releaseSessionUrlFormat = "/series/{0}/session/{1}";
        const String updatePuzzleStatusUrlFormat = "events/{0}/teams/{1}/puzzleStates/{2}";
        private String baseUrl;
        private HttpClient client;
        private PZAuthentication pzAuthorization;
        private String seriesId;
        private String sessionToken;

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
        public async Task startSession(String seriesId, PZAuthentication auth)
        {
            try
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
                this.seriesId = seriesId;
                String sessionUrl = String.Format(sessionUrlFormat, seriesId);
                this.pzAuthorization = auth;
                Console.WriteLine("REached start session");

                HttpResponseMessage tokenResponse = await client.PostAsJsonAsync(sessionUrl, this.pzAuthorization);
                if (tokenResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine("Reached success");
                    Token token = await tokenResponse.Content.ReadAsAsync<Token>();
                    this.sessionToken = token.token;
                    client.DefaultRequestHeaders.Add("token", sessionToken);
                    Console.WriteLine("Token: " + this.sessionToken);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: " + ex.Message + " " + ex.HResult);
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
                    throw new HttpRequestException("Error during releaseSession");
                }
            }
        }

        public async Task updatePuzzleState(String eventId, String teamId, String puzzleId, LogEntry le)
        {
            IEnumerable<String> headerValues = null;
            client.DefaultRequestHeaders.TryGetValues("token", out headerValues);
            String updateUrl = String.Format(updatePuzzleStatusUrlFormat, eventId, teamId, puzzleId);
            try
            {
                HttpResponseMessage updateResponse = await client.PutAsJsonAsync(updateUrl, le);
                if (!updateResponse.IsSuccessStatusCode)
                {
                    throw new Exception("Error in updatePuzzleState:" + updateResponse.StatusCode);
                }
            }
            catch (Exception ex)
            {
                //TODO: report error back to the caller - 
                MyConsole.WriteError(String.Format("Exception in UpdatePuzzleState for (team {0}, puzzle {1}): {2}" , le.teamId, le.puzzleId, ex.Message));
            }


        }
    }
}
