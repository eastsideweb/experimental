//
//   MODULE: PSDBClient
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdbClient.series.ts
//   DESCRIPTION: This file contains the detailed functionality provided within the series
//
//   HISTORY:
//     Date            By  Comment
//     2014 July 01    NSA  Created
// 
// Handles all the series related functionality for PSDB client

module psdbClient {
    export module series {
        //------------------------ PUBLIC METHODS-------------------------------------------
        export function initModule($content: JQuery, $modal: JQuery) {
            jqueryMap.$content = $content;
            jqueryMap.$modal = $modal;
        }

        export function loadSeries(sessionData : any) {
            session = sessionData.token;
            var reqParams: IRequestParameters = { session: session, loadPreloader: true };
            util.getRequestAsync(config.eventsUrl, renderEventsTemplate, reqParams);
        }

        //--------------------------END PUBLIC METHODS--------------------------------------------

        var session,
            jqueryMap = { $content: null, $modal: null };

        //---------------------------- DOM METHODS-------------------------------------------------
        function renderEventsTemplate(err : IPSDBClientError, data : JSON) {
            if (err !== null) {
                util.handleError(err, jqueryMap.$modal);
            }
            else {
                util.renderTemplate(config.listTemplate, { items: data }, jqueryMap.$content);
                //jqueryMap.$content.find('a').click(onTapEvents);
            }
        }
        //----------------------------END DOM METHODS----------------------------------------------------
    }
}