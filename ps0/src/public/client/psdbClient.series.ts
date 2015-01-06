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
/// <reference path="inc/jqueryui.d.ts"/>

module psdbClient {
    export module series {
        //------------------------ PUBLIC METHODS-------------------------------------------
        export function initModule($content: JQuery, $modal: JQuery, $signoutButton: JQuery) {
            jqueryMap.$content = $content;
            jqueryMap.$modal = $modal;
            jqueryMap.$signoutButton = $signoutButton;
        }

        export function loadSeries(sessionData : any) {
            stateMap.session = sessionData.token;
            stateMap.seriesId = sessionData.seriesId;
            stateMap.roleType = sessionData.roleType;
            // Load the list of nested lists available on this series
            util.renderTemplate(config.listTemplate, { items: objList }, jqueryMap.$content);
            jqueryMap.$content.find('a').on('utap.utap', onTapObject);
            jqueryMap.$signoutButton.show();
            jqueryMap.$signoutButton.attr("disabled", false);
            jqueryMap.$signoutButton.on('click', onLogout);
        }

        //--------------------------END PUBLIC METHODS--------------------------------------------

        var stateMap = { session: null, seriesId: null, roleType: null, objType: null },
            jqueryMap = { $content: null, $modal: null, $signoutButton: null },
            objList = [
                { _id: "events", name: "Events", description: "List of events", url: "/events" },
                { _id: "players", name: "Players", "description": "List of players", url: "/players" },
                { _id: "puzzles", name: "Puzzles", "description": "List of Puzzles", url: "/Puzzles" },
                { _id: "teams", name: "Teams", "description": "List of Teams", url: "/Teams" }
            ];

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

        function onTapObject(event) {
            stateMap.objType = $(this).attr('id');
            //remove the utap event from existing elements
            jqueryMap.$content.find('a').off('utap.utap', onTapObject);
            //get the list of the given object type for this series
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            util.getRequestAsync('/' + stateMap.objType, renderObjectList, reqParams);
            return false;
        };

        function renderObjectList(err: any, result: JSON) {
            if (err !== null) {
                var error: IPSDBClientError = { 'title': err.title, 'details': err.details, 'code': null };
                util.handleError(error, jqueryMap.$modal);
            }
            else {
                util.renderTemplate(config.objlistTemplate, { items: result }, jqueryMap.$content);
                jqueryMap.$content.find('#objlist').selectable({
                    stop: function () {
                        var selectedItems, countSelect;
                        selectedItems = jqueryMap.$content.find('li').filter(function () {
                            return $(this).hasClass('ui-selected');
                        });
                        countSelect = selectedItems.length;
                        //alert('count = ' + countSelect);
                        var buttons = jqueryMap.$content.find('.button-small');
                        var button: JQuery = $('#signoutButton');
                        // Disable appropriate buttons
                        switch (countSelect) {
                            case 0:
                                // Disable all buttons
                                jqueryMap.$content.find('.button-small').prop('disabled', true);
                                jqueryMap.$content.find('#addButton').prop('disabled', false);
                                break;
                            case 1:
                                //jqueryMap.$content.find('.button-small').css('color', '#00ff00');
                                jqueryMap.$content.find('.button-small').prop('disabled', false);
                                break;
                            default:
                                jqueryMap.$content.find('.button-small').prop('disabled', false);
                                jqueryMap.$content.find('#editButton').prop('disabled', true);
                                break;
                        }
                    }
                });
            }
        }

        function onLogout() {

            jqueryMap.$signoutButton.attr("disabled", true);
            jqueryMap.$signoutButton.off('click', onLogout);

            // We should release the session token we have
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            util.deleteRequestAsync(config.releaseTokenUrl.replace('{id}', stateMap.seriesId).replace('{token}', stateMap.session), publishLogout, reqParams);
            return false;
        }
        function publishLogout(err: any, result) {
            // Reset the state variables - 
            resetStateMap();
            $.gevent.publish('psdbClient-logout', null);
        }
        //----------------------------END DOM METHODS----------------------------------------------------

        //----------------------------START HELPER METHODS----------------------------------------------------
        function resetStateMap() {
            stateMap.session = null;
            stateMap.seriesId = null;
            stateMap.roleType = null;
            stateMap.objType = null;
        }
        //----------------------------END HELPER METHODS----------------------------------------------------

    }
}