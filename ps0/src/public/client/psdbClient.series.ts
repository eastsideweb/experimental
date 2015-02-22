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

        export function loadSeries(sessionData: any) {
            resetStateMap();
            stateMap.session = sessionData.token;
            stateMap.seriesId = sessionData.seriesId;
            if (sessionData.seriesParams !== null && sessionData.seriesParams !== undefined) {
                alert("Found seriesparams in loadseries: " + JSON.stringify(sessionData.seriesParams));
            }
            // Set the roletype correctly - the roletype found in sessiondata should be used, since that's what the
            // token corresponds to.
            stateMap.seriesAnchorMap.roletype = sessionData.roleType;
            updateSeries(sessionData.seriesParams)
        }

        export function unloadSeries() {
            // We should logout of current series if any synchronously
            if (stateMap.session !== null) {
                // We should release the session token we have
                var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
                var url: string = config.releaseTokenUrl.replace('{id}', stateMap.seriesId).replace('{token}', stateMap.session);
                util.deleteRequest(url, function (err, result) {
                    resetStateMap();
                }, reqParams);                
            }
        }

        // Funtion that updates the view within the current series
        export function updateSeries(seriesParams: any): boolean {
            // Update the view based on these params
            if (!stateOk(seriesParams)) {
                // No valid series loaded or the roletype is not consistent            
                return false;
            }

            if (seriesParams === null || seriesParams === undefined) {
                // Should show the objtype list
                loadSeriesObjList();
                return true;
            }

            // Check if type is set in seriesParams
            if (seriesParams.type === null || seriesParams.type === undefined) {
                // No obj type specified, show series object list
                loadSeriesObjList();
                return true;
            }
            else {
                // an objtype is specified
                // check if the id is set in seriesParams
                if (seriesParams.id === null || seriesParams.id === undefined) {
                    // No id specified, load the list of objects of given type
                    loadObjList(seriesParams.type);
                    return true;
                }
                else {
                    // an id was specified for the given type
                    // check if subtype is set in seriesParams
                    if (seriesParams.subtype === null || seriesParams.subtype === undefined) {
                        // No subtype specified, load the object view
                        loadObject(seriesParams.type, seriesParams.id);
                        return true;
                    }
                    else {
                        // there is a subtype
                        loadObjSublist(seriesParams.type, seriesParams.id, seriesParams.subtype);
                        return true;
                    }
                }
            }
            return true;
        }

        export function getCurrentSeriesId(): string {
            return stateMap.seriesId
        }
        //--------------------------END PUBLIC METHODS--------------------------------------------

        var stateMap = {
            session: null, seriesId: null,
            seriesAnchorMap: {
                type: null, //{ 'instructors': true, 'events': true, 'players': true, 'teams': true, 'puzzles': true }
                id: null,
                subtype: null,
                roletype: null //{ 'administrator': true, 'instructor': true, 'player': true }
            }
            },
            jqueryMap = { $content: null, $modal: null, $signoutButton: null },
            objList = [
                { _id: "events", name: "Events", description: "List of events", url: "/events" },
                { _id: "players", name: "Players", "description": "List of players", url: "/players" },
                { _id: "puzzles", name: "Puzzles", "description": "List of Puzzles", url: "/Puzzles" },
                { _id: "teams", name: "Teams", "description": "List of Teams", url: "/teams" },
                { _id: "instructors", name: "Instructors", "description": "List of Instructors", url: "/instructors" }
            ];

        //---------------------------- DOM METHODS-------------------------------------------------

        function onTapObject(event) {
            stateMap.seriesAnchorMap.type = $(this).attr('id');
            //remove the utap event from existing elements
            jqueryMap.$content.find('a').off('utap.utap', onTapObject);
            //get the list of the given object type for this series
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            util.getRequestAsync('/' + stateMap.seriesAnchorMap.type, renderObjectList, reqParams);
            return false;
        }

        function renderObject(err: any, result: JSON) {
            var error: IPSDBClientError, redirectUrl = {
                series: stateMap.seriesId,
                _series: { type: stateMap.seriesAnchorMap.type, roletype: stateMap.seriesAnchorMap.roletype }
            };
            if (err !== null ) {
                error = { 'title': err.title, 'details': err.details, 'code': null };
                util.handleError(error, jqueryMap.$modal, redirectUrl);
                return;
            }
            var items: any = result; /* Work around to make typescript compilor happy */
            if (items.length === 0) {
                error = { 'title': 'Object not found', 'details': 'No object found for the given id?', 'code': null };
                 util.handleError(error, jqueryMap.$modal, redirectUrl);
            }
            else {
                util.renderTemplate(config.objectTemplate, { seriesId: stateMap.seriesId, type: stateMap.seriesAnchorMap.type, item: result[0] }, jqueryMap.$content);
                jqueryMap.$content.find('#objdeleteButton').on('click', deleteObject);
            }
            enableSignoutButton(/*enable*/true);
        }
        function deleteObject() {
            var objId, reqParams: IRequestParameters , url:string;
            objId = jqueryMap.$content.find('#rootItem').attr('objId');
            reqParams = { session: stateMap.session, loadPreloader: true };
            url = config.deleteObjUrl.replace('{id}', objId).replace('{type}', stateMap.seriesAnchorMap.type);
            util.deleteRequestAsync(url, function (err, result) {
                psdbClient.shell.changeAnchorPart({
                    series: stateMap.seriesId,
                    _series: { type: stateMap.seriesAnchorMap.type, roletype: stateMap.seriesAnchorMap.roletype}
                });
            }, reqParams);                
        }
        function renderObjectList(err: any, result: JSON) {
            if (err !== null) {
                var error: IPSDBClientError = { 'title': err.title, 'details': err.details, 'code': null };
                util.handleError(error, jqueryMap.$modal);
            }
            else {
                util.renderTemplate(config.objlistTemplate, { items: result, seriesId: stateMap.seriesId, objtype: stateMap.seriesAnchorMap.type  }, jqueryMap.$content);
                enableSignoutButton(/*enable*/true);
                // By default, none of the items in the obj list will be selected. Disable all buttons except for the addbutton
                jqueryMap.$content.find('.button-small').prop('disabled', true);
                var $addBtn = jqueryMap.$content.find('#addButton');
                $addBtn.attr('disabled', false);
                $addBtn.on('click', renderAddobjTemplate);

              /*  jqueryMap.$content.find('#objlist').selectable({
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
                                // Disable all buttons, except for the add button
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
                }); */
            }
        }
        function renderAddobjTemplate() {
            util.renderTemplate(config.addobjTemplate, {objType: stateMap.seriesAnchorMap.type}, jqueryMap.$content);
            var $saveBtn = jqueryMap.$content.find('#saveButton');
            $saveBtn.on('click', addObjToCollection);
            return false;
        }
        function addObjToCollection() {
            //get data from form
            var input = $('#addForm :input').serializeArray();
            var inputObject: any = {};
            $.each(input,
                function (index: any, item: any) {
                    inputObject[item.name] = item.value;
                });
            //active field should be a boolean value
            inputObject["active"] = (inputObject["active"] === "true") ? true : false;
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            util.postRequestAsync('/' + stateMap.seriesAnchorMap.type, inputObject, function (err: IPSDBClientError, data) {
                if (err) {
                    jqueryMap.$content.find('#error').html(err.title);
                } else {
                    //add object was successful return to previous screen
                     var anchorSchemaMap = {
                          series: stateMap.seriesId,
                          _series: {
                              type: stateMap.seriesAnchorMap.type,
                              role: stateMap.seriesAnchorMap.roletype
                          }
                      };               
                    psdbClient.shell.changeAnchorPart(anchorSchemaMap);
                }
            }, reqParams);
        }
        function renderObjectSublist(err: any, result: JSON) {
            var itemList = result;
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            var objToCollectionMap = {
                eventIds: "events",
                playerIds: "players",
                puzzleIds: "puzzles",
                teamIds: "teams",
                instructorIds: "instructors"
            };
            var queryUrl = objToCollectionMap[stateMap.seriesAnchorMap.subtype];
            util.getRequestAsync(queryUrl, function (err: any, queryResult: JSON) {
                var idList: any = result; 
                if (idList.length === 0) {
                   var error = { 'title': 'Object not found', 'details': 'No object found for the given id?', 'code': null };
                }
                else {
                    //grab the name and discription for the objects corresponding ot the objectIds in result from collection
                    var objId;
                    var collList: any = queryResult;
                    var arr = [];
                    for (var j = 0; j < idList.length; j++) {
                        objId = idList[j];
                        for (var i = 0; i < collList.length; i++) {
                            if (collList[i]._id === objId) {
                                arr.push(collList[i]);
                                break;
                            }
                        }
                    }
                    util.renderTemplate(config.objlistTemplate, { items: arr, seriesId: stateMap.seriesId, objtype: stateMap.seriesAnchorMap.type }, jqueryMap.$content);
                } }, reqParams);

        }
       
        function onLogout() {

            enableSignoutButton(/*enable*/false);
            // We should release the session token we have
            //var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            //util.deleteRequestAsync(config.releaseTokenUrl.replace('{id}', stateMap.seriesId).replace('{token}', stateMap.session), publishLogout, reqParams);
            $.uriAnchor.setAnchor({});
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
            stateMap.seriesAnchorMap.id = null;
            stateMap.seriesAnchorMap.roletype = null;
            stateMap.seriesAnchorMap.subtype = null;
            stateMap.seriesAnchorMap.type = null;
        }
        function stateOk(seriesParams: any) {
            if (stateMap.session === null || stateMap.session === undefined
                || stateMap.seriesId === null || stateMap.seriesId === undefined
                || (seriesParams !== null && seriesParams !== undefined && seriesParams.roletype !== null && seriesParams.roletype !== undefined && stateMap.seriesAnchorMap.roletype !== seriesParams.roletype)) {
                alert("returning false stateOk: seriesParams.roletype = " + seriesParams.roletype);
                return false;
            }
            return true;
        }

        function loadSeriesObjList() {
            // Update the stateMap to reflect the current view
            stateMap.seriesAnchorMap.id = null;
            stateMap.seriesAnchorMap.subtype = null;
            stateMap.seriesAnchorMap.type = null;

            // Load the list of object types available on this series
            util.renderTemplate(config.objtypeTemplate, { items: objList, seriesId: stateMap.seriesId }, jqueryMap.$content);
            enableSignoutButton(/*enable*/true);

        }

        // Function to load a list of given obj type ('players', 'events', etc)
        function loadObjList(objtype: string) {
            stateMap.seriesAnchorMap.type = objtype;
            stateMap.seriesAnchorMap.id = null;
            stateMap.seriesAnchorMap.subtype = null;
            //get the list of the given object type for this series
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            util.getRequestAsync('/' + stateMap.seriesAnchorMap.type, renderObjectList, reqParams);
        }

        // Function to load a specific obj of given type 
        function loadObject(objtype: string, objId: number) {
            stateMap.seriesAnchorMap.type = objtype;
            stateMap.seriesAnchorMap.id = objId;
            stateMap.seriesAnchorMap.subtype = null;
            //get the list of the given object type for this series
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            util.getRequestAsync('/' + stateMap.seriesAnchorMap.type + '/' + stateMap.seriesAnchorMap.id, renderObject, reqParams);
        }
        //Function to load a list of sub objs for a specific obj of a given type
        function loadObjSublist(objtype: string, objId:number, objSubtype: string) {
            stateMap.seriesAnchorMap.type = objtype;
            stateMap.seriesAnchorMap.id = objId;
            stateMap.seriesAnchorMap.subtype = objSubtype;
            //get the list of the given object type for this series
            var reqParams: IRequestParameters = { session: stateMap.session, loadPreloader: true };
            util.getRequestAsync('/' + stateMap.seriesAnchorMap.type + '/' + stateMap.seriesAnchorMap.id + '/' + stateMap.seriesAnchorMap.subtype, renderObjectSublist, reqParams);
        }
        function enableSignoutButton(enable: boolean) {
            if (enable) {
                jqueryMap.$signoutButton.show();
                jqueryMap.$signoutButton.attr("disabled", false);
                jqueryMap.$signoutButton.on('click', onLogout);
            }
            else {
                jqueryMap.$signoutButton.attr("disabled", true);
                jqueryMap.$signoutButton.off('click', onLogout);
                jqueryMap.$signoutButton.hide();
            }

        }
        //----------------------------END HELPER METHODS----------------------------------------------------

    }
}