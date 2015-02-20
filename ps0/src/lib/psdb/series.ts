//
//   MODULE: series
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdb.ts
//   DESCRIPTION: File containing puzzleSeries class
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 28th    TJ  Created
//     2014 Jun 20th    TJ  findObj implemented
//     2014 Jun 28th    TJ  addObj implemented. SeriesObjTypeInfo finalized for events
/// <reference path="../../inc/ext/node.d.ts"/>
/// <reference path="../../inc/psdb.d.ts"/>
/// <reference path="../../inc/crud.d.ts"/>
//  Contains the class that implements the PuzzleSeries interface

import crudmodule = require('./crudmodule');
import utils = require('../utils');
import validator = require('../validator');

// Interface that describes the information relevant for a SeriesObjType
interface SeriesObjTypeInfo {
    // Name of the collection in the series database that holds objects of this type 
    collectionName: string;
    // A map of role => array of properties that are allowed for that role
    // Possible values of writePermission are "unrestricted", empty array (indicating no permission) or an array of allowed properties
    allowedPropertyMap: any;
    fixObjForInsertion?: (obj: any) => any;
}

class PuzzleSeries implements IPuzzleSeries {
    private seriesId: string;
    private role: string;
    private credentials: ICredentials;

    // Begin static var/functions
    static initDone: boolean = false;

    // jsonValidator used for schema validation
    static jsonValidator: any;

    // Map of itemType to item field name for all allowed subObject Types
    static seriesItemTypeToFieldNameMap: any = {
        'instructors': 'instructorIds',
        'players': 'playerIds',
        'puzzles': 'puzzleIds',
        'teams': 'teamIds'
    };


    // Map of schema for all allowed SeriesObjectTypes
    static seriesObjTypeMap: any = {
        'instructors':
        {
            collectionName: global.config.psdb.instructorsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "active"],
                    "write": ["name", "description", ],
                },
                'player': {
                    "read": ["name", "description", "_id", "active"],
                    "write": [],
                }
            }
        },
        'events': {
            collectionName: global.config.psdb.eventsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "active", "status", "puzzleIds", "instructorIds", "teamIds"],
                    "write": ["name", "description", "active", "status", "puzzleIds", "instructorIds", "teamIds"],
                },
                'player': {
                    "read": ["name", "description", "_id", "active"],
                    "write": [],
                }
            },
            fixObjForInsertion: function (obj) {
                if (obj.status === null || obj.status === undefined) {
                    obj.status = "notStarted";
                }
                obj.puzzleIds = [];
                obj.playerIds = [];
                obj.instructorIds = [];
                obj.teamIds = [];
                return obj;
            },

        },
        'puzzles': {
            collectionName: global.config.psdb.puzzlesCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "active"],
                    "write": ["name", "description", ],
                },
                'player': {
                    "read": ["name", "description", "_id", "active"],
                    "write": [],
                }
            },
            fixObjForInsertion: function (obj) {
                return obj;
            }
        },
        'teams': {
            collectionName: global.config.psdb.teamsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "active", "puzzleIds", "playerIds", "teamLeadId"],
                    "write": ["name", "description", "active", "puzzleIds", "playerIds", "teamLeadId"],
                },
                'player': {
                    "read": ["name", "description", "_id", "active", "puzzleIds", "playerIds", "teamLeadId"],
                    "write": [],
                }
            },
            fixObjForInsertion: function (obj) {
                obj.puzzleIds = [];
                obj.playerIds = [];
                obj.teamLeadId = obj.teamLeadId || "";
                return obj;
            }
        },
        'players': {
            collectionName: global.config.psdb.playersCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "active"],
                    "write": ["name", "description", ],
                },
                'player': {
                    "read": ["name", "description", "_id", "active"],
                    "write": [],
                }
            }
        },
        // we will not allow addObj for this objType because the only way to add an object of this type is through updatePuzzleState api
        //'puzzleStates': {
        //    collectionName: global.config.psdb.playersCollectionName,
        //    allowedPropertyMap: {
        //        'administrator': {
        //            "read": "unrestricted",
        //            "write": "unrestricted"
        //        },
        //        'instructor': {
        //            "read": ["puzzleId", "solved", "teamId", "_id"],
        //            "write": ["puzzleId", "solved", "teamId", "_id"],
        //        },
        //        'player': {
        //            "read": ["puzzleId", "solved", "teamId", "_id"],
        //            "write": [],
        //        }
        //    },
        //},
        'annotations': {
            collectionName: global.config.psdb.annotationsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "puzzleIds", "eventIds", "teamIds","playerIds"],
                    "write": ["name", "description", "_id", "puzzleIds", "eventIds", "teamIds", "playerIds"],
                },
                'player': {
                    "read": ["name", "description", "_id", "puzzleIds", "eventIds", "teamIds", "playerIds"],
                    "write": [],
                }
            },
            fixObjForInsertion: function (obj) {
                return obj;
            }
        },
    };



    static initializeObjTypeMap = function () {
        var objType;
        if (PuzzleSeries.initDone) {
            return;
        }
        PuzzleSeries.jsonValidator = new validator(["annotations", "events", "instructors", "players", "puzzles", "puzzleStates", "series", "teams"]);
        PuzzleSeries.initDone = true;
    };

    static checkObjType = function (objType: string /*SeriesObjectType*/) {
        if (!PuzzleSeries.seriesObjTypeMap[objType]) {
            utils.log(utils.getShortfileName(__filename) + " returning false out of checkObjType() with objType: " + objType);
            return false;
        }
        else {
            return true;
        }
    };

    static pruneFields = function (fieldsReturned: any, objType: string, role: string): any {
        //TODO: prune fields based on the role
        return fieldsReturned;
    }

    static commonFixObjForInsertion = function (objInfo, writePermission) : any {
        var fixedObj : any = {};
        // **WARNING** assuming only static fields coming in - otherwise we need to do a deep copy
        for (var prop in objInfo) {
            // Copy only the properties that are allowed by write permission
            // Dont copy the "_id" property
            if (prop !== "_id" && (writePermission === "unrestricted" || writePermission[prop])) {
               fixedObj[prop] = objInfo[prop];
            }
        }
        utils.log("*********** " + utils.getShortfileName(__filename) + "after copy " + JSON.stringify(fixedObj));
        // Fix the object with common properties                                
        // Make sure the object is marked non-active if undefined
        fixedObj.active = (fixedObj.active === true) ? true : false;
        fixedObj.description = fixedObj.description || "";

        utils.log("*********** " + utils.getShortfileName(__filename) + "after fixing " + JSON.stringify(fixedObj));
        return fixedObj;
    }

    static checkObjForUpdate = function (objInfo, writePermission): boolean {
        if (writePermission === "unrestricted") {
            return true;
        }
        for (var prop in objInfo) {
            // Allow only the properties that are allowed by write permission
            if (!writePermission[prop]) {
                return false;
            }
        }
        return true;
    }


    static composePuzzleStateId = function (teamId: string, puzzleId: string) {
        return teamId + "_" + puzzleId;
    }

    // End static var/functions


    constructor(public token: IToken, public crudHandle: DBCRUD) {
        if (!PuzzleSeries.initDone) {
            PuzzleSeries.initializeObjTypeMap();
        }
    }


    // start utility methods

    // Utility method to check that the updates meant for given currentObj of given objType meet the symantics of that objType. If any of the updates
    // don't meet the symantics, error is returned and the update is rejected
    checkObjectValidityForUpdate(objType: string /*SeriesObjectType*/, currentObj: any, updateFields, callback: SimpleCallBack): void {
        var err: Error = { name: "InvalidUpdate", message: "" };
        switch (objType) {
            case "events":
                if (updateFields.status) {
                    // Make sure the update of the status is valid: notStarted -> started -> ended
                    if (currentObj.status === "ended" ||
                        (currentObj.status === "notStarted" && updateFields.status !== "started") ||
                        (currentObj.status === "started" && updateFields.status !== "ended")) 
                    {
                        err.message = "Events: status update (from " + currentObj.status + " to " + updateFields.status +
                        ") is invalid";
                        callback(err);
                        return;
                    }
                }
                // Check if any of the sublists are specified in the updateFields, if so, return error
                if (updateFields.instructors !== undefined || updateFields.players !== undefined || updateFields.puzzles !== undefined || updateFields.teams !== undefined) {
                    err.message = "Sublists cannot be updated through updateObj";
                    callback(err);
                    return;
                }
                break;
            case "teams":
                // Check if any of the sublists are specified in the updateFields, if so, return error
                if (updateFields.players !== undefined) {
                    err.message = "Sublists cannot be updated through updateObj";
                    callback(err);
                    return;
                }
                if (updateFields.teamLeadId) {
                    // Make sure the provided teamLeadId is a valid id and that the player is already part of the team
                    if (currentObj.playerIds.lastIndexOf(updateFields.teamLeadId) === -1) {
                        // new teamLead is not in the players list
                        err.message = "New teamLead is not part of the team";
                        callback(err);
                        return;
                    }
                }
                break;
            case "players":
                break;
            case "instructors":
                break;
            case "puzzles": 
                break;
            default:
                break;
        }
        callback(null);
    }

    // Utility method to check that the updates meant for given currentObj of given objType meet the symantics of that 
    // objType. This is meant for the subtype list update
    // If any of the updates don't meet the symantics, error is returned
    checkObjectValidityForListUpdate(objType: string /*SeriesObjectType*/, currentObj: any, updateFields, callback: SimpleCallBack): void {
        //utils.log("checkObjectValidityForListUpdate called with updateFields " + JSON.stringify(updateFields));
        var err: Error = { name: "InvalidUpdate", message: "" };
        var playerIdsFlattened: any[];
        switch (objType) {
            case "events":
                // No semantics check here
                break;
            case "teams":
                if (updateFields.playerIds) {
                    // Need to make sure the given players are not already part of another team
                    this.crudHandle.findObj(global.config.psdb.teamsCollectionName, {
                        "_id": { $nin: [currentObj._id] },
                    }, { "playerIds": 1, "_id": 0 }, function (err2: Error, result: any[]) {
                            if (result !== undefined && result !== null && result.length !== 0) {
                                // Found atleast one other team - check if any of them has any of the incoming playerIds
                                playerIdsFlattened = [];
                                result.forEach(function (item) {
                                    item.playerIds.forEach(function (pid) {
                                        playerIdsFlattened.push(pid);
                                    });
                                });
                                for (var i = 0; i < updateFields.playerIds.length; i++) {
                                    if (playerIdsFlattened.lastIndexOf(updateFields.playerIds[i]) !== -1) {
                                        utils.log("checkObjectValidityForListUpdate detected existing playerId: " + updateFields.playerIds[i]);
                                        callback(utils.errors.invalidItemId);
                                        return;
                                    }
                                }
                                callback(null);
                                return;
                            }
                            else {
                                // No other team present. We are clear!
                                callback(null);
                                return;
                            }
                        });
                }
                break;
            case "players":
            case "instructors":
            case "puzzles": 
                // There is no sublist field for players/instructors/puzzles???
                err.message = "Invalid update";
                callback(err);
                return;
            default:
                // There is no sublist field for players/instructors/puzzles???
                err.message = "Invalid update";
                callback(err);
                return;
        }
    }

    // end utility methods

    //------------------ Begin PuzzleSeries interface methods ------------------
    // Activate/Deactivate a given object from the given SeriesObjectType collection having given objId
    // when the objType is "event", activate will also mark start of that event and deactivate will mark end of that event
    // Possible err:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    setActive(objType: string /*SeriesObjectType*/, objId: string, active: boolean, callback: SimpleCallBack ): void {
        if (objType === "puzzleStates" /* there is no active field on the puzzleState obj */
            || !PuzzleSeries.checkObjType(objType)) {
            utils.log(utils.getShortfileName(__filename) + " returning invalidObjType error with objType: " + objType);
            callback(utils.errors.invalidObjType);
            return;
        }
        this.crudHandle.updateObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, { "_id": objId }, { "active": active }, function (err: Error, count: number) {
            callback(err);
        });
    }

    // Update static fields of a given object from the given SeriesObjectType collection having given objId
    // Possible err:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    updateObj(objType: string /*SeriesObjectType*/, objId: string, updateFields: any, callback: CallBackWithCount): void {
        var self = this;
        // Check if objType is valid
        if (objType === "puzzleStates" /* We dont allow updating of puzzleState through this api, it is to be done with the updatePuzzleState api */
            || !PuzzleSeries.checkObjType(objType)) {
            utils.log(utils.getShortfileName(__filename) + " returning invalidObjType error with objType: " + objType);
            callback(utils.errors.invalidObjType, null);
            return;
        }

        // Check write access for this object for given role
        var writePermission = PuzzleSeries.seriesObjTypeMap[objType].allowedPropertyMap[this.token.role].write;

        if (writePermission !== "unrestricted" && (Array.isArray(writePermission) && writePermission.length === 0)) {
            callback(utils.errors.UnauthorizedAccess, null);
            return;
        }
        if (!PuzzleSeries.checkObjForUpdate(updateFields, writePermission)) {
            callback(utils.errors.UnauthorizedAccess, 0);
        }
        else {
            self.crudHandle.findObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, { "_id": objId }, {}, function (innererr1: Error, objList: any[]) {
                if (innererr1) {
                    callback(innererr1, 0);
                }
                else {
                    if (objList.length !== 1) {
                        callback(utils.errors.inconsistentDB, 0);
                    }
                    else {
                        self.checkObjectValidityForUpdate(objType, objList[0], updateFields, function (innererr2: Error) {
                            if (innererr2) {
                                callback(innererr2, 0);
                            }
                            else {
                                //Updates are valid, proceed with the update
                                self.crudHandle.updateObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, { "_id": objId }, updateFields, function (innererr3: Error, count: number) {
                                    if (innererr3) {
                                        callback(innererr3, 0);
                                    }
                                    else {
                                        if (count < 1) {
                                            callback(utils.errors.inconsistentDB, 0);
                                        }
                                        else {
                                            callback(null, count);
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    // Add a new object of given type
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "EmptyName"             "name field missing"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    addObj(objType: string /*SeriesObjectType*/, objInfo: any, callback: (err: Error, objInfo: ISeriesObject) => void): void {
        var self = this, writePermission, fixedObj;
        // Check if objType is valid
        if (objType === "puzzleStates" /* We dont allow adding of puzzleState through this api, it is to be done with the updatePuzzleState api */
             || !PuzzleSeries.checkObjType(objType)) {
            utils.log(utils.getShortfileName(__filename) + " returning invalidObjType error with objType: " + objType);
            callback(utils.errors.invalidObjType, null);
            return;
        }

        // Check write access for this object for given role
        writePermission = PuzzleSeries.seriesObjTypeMap[objType].allowedPropertyMap[this.token.role].write;
        
        if (writePermission !== "unrestricted" && (Array.isArray(writePermission) && writePermission.length === 0)) {
            callback(utils.errors.UnauthorizedAccess, null);
            return;
        }
        // Check the schema for the objType using the validator
        PuzzleSeries.jsonValidator.checkSchema(objType, objInfo, function (innerErr1) {
            if (innerErr1 && innerErr1.length !== 0) {
                console.log(innerErr1);
                var error = { "name": "InvalidObjSchema", "message": innerErr1.toString() };
                callback(error, null);
            }
            else {
                // Got objInfo that has valid schema, insert it in the db after massaging it
                fixedObj = PuzzleSeries.commonFixObjForInsertion(objInfo, writePermission);
                //Check if the object type has an additional fixObjForInsertion 
                if (PuzzleSeries.seriesObjTypeMap[objType].fixObjForInsertion && typeof (PuzzleSeries.seriesObjTypeMap[objType].fixObjForInsertion) === "function") {
                    fixedObj = PuzzleSeries.seriesObjTypeMap[objType].fixObjForInsertion(fixedObj);
                }
                utils.log("*********** " + utils.getShortfileName(__filename) + "after fixing second time " + JSON.stringify(fixedObj));

                self.crudHandle.insertObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, fixedObj, function (innerErr2: Error, resultObj: any) {
                    if (innerErr2 !== null) {
                        callback(innerErr2, null);
                    }
                    else {
                        // Insertion was successful, prune the fields before returning the object
                        var prunedFieldsReturned = PuzzleSeries.pruneFields(resultObj, objType, self.token.role);
                        utils.log("*********** " + utils.getShortfileName(__filename) + "returning " + JSON.stringify(prunedFieldsReturned));
                        callback(null, prunedFieldsReturned);
                    }
                });
            }
        });
    }

    // Delete an object with given object id from the series
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    deleteObj(objType: string /*SeriesObjectType*/, objInfo: any, callback: CallBackWithCount): void {
        var self = this, writePermission;
        // Check if objType is valid
        if (!PuzzleSeries.checkObjType(objType)) {
            utils.log(utils.getShortfileName(__filename) + " returning invalidObjType error with objType: " + objType);
            callback(utils.errors.invalidObjType, null);
            return;
        }

        // Check write access for this object for given role
        writePermission = PuzzleSeries.seriesObjTypeMap[objType].allowedPropertyMap[this.token.role].write;

        if (writePermission !== "unrestricted" && (Array.isArray(writePermission) && writePermission.length === 0)) {
            callback(utils.errors.UnauthorizedAccess, null);
            return;
        }

        self.crudHandle.deleteObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, objInfo, function (innerErr2: Error, count: number) {
            if (innerErr2 !== null) {
                callback(innerErr2, null);
            }
            else {
                if (count < 1) {
                    callback(utils.errors.inconsistentDB, 0);
                }
                else {
                    //success!!
                    callback(null, 1);
                }
            }
        });
    }

    // Add given set of items to the given type
    // Possible errors:
    //      "InvalidItemId"         "One or more invalid item ids provided"
    //      "InvalidObjId"         "Invalid object id specified"
    //      "ItemNotActive"       "One or more item is deactivate"
    //      "PlayerOnAnotherTeam"   "One or more player is already part of another team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    addItemsToObj(listItemIds: string[], itemType: string, objId: string, objType: string, callback: SimpleCallBack): void {
        var currentItemList: string[], updateField, self = this;
        if (listItemIds === null || listItemIds === undefined || listItemIds.length === 0) {
            callback(null);
            return;
        }
        // First check if the item type and obj type is valid
        // Check if item Type is valid
        if (!PuzzleSeries.checkObjType(itemType)) {
            utils.log(utils.getShortfileName(__filename) + " returning invalidItemType error with itemType: " + itemType);
            callback(utils.errors.invalidItemType);
            return;
        }
        // Check if objType is valid
        if (!PuzzleSeries.checkObjType(objType)) {
            utils.log(utils.getShortfileName(__filename) + " returning invalidObjType error with objType: " + objType);
            callback(utils.errors.invalidObjType);
            return;
        }

        // Check if all the items in the listItemIds are active
        //**** MONGODB dependency in the query construction ****MONGODB dependency //
        this.crudHandle.findObj(PuzzleSeries.seriesObjTypeMap[itemType].collectionName, { "_id": { $in: listItemIds } }, { "active": 1 }, function (innerErr: Error, objList: any[]) {
            if (objList === undefined || objList === null) {
                callback(utils.errors.inconsistentDB);
                return;
            }

            if (objList.length !== listItemIds.length) {
                // Atleast one of the incoming ids was not found in the collection
                callback(utils.errors.invalidItemId);
                return;
            }

            // check if all are active
            for (var i = 0; i < objList.length; i++) {
                if (!objList[i].active) {
                    utils.log("####******** found inactive item " + objList[i]._id);
                    callback(utils.errors.itemNotActive);
                    return;
                }
            }
            // Check write access for this object for given role
            var writePermission = PuzzleSeries.seriesObjTypeMap[objType].allowedPropertyMap[self.token.role].write;

            if (writePermission !=="unrestricted" && (Array.isArray(writePermission) && writePermission.length === 0)) {
                callback(utils.errors.UnauthorizedAccess);
                return;
            }

            updateField = {};
            updateField[PuzzleSeries.seriesItemTypeToFieldNameMap[itemType]] = listItemIds;
            if (!PuzzleSeries.checkObjForUpdate(updateField, writePermission)) {
                callback(utils.errors.UnauthorizedAccess);
                return;
            }
            else {
                self.crudHandle.findObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, { "_id": objId }, {}, function (err2: Error, result: any[]) {
                    var currentObj: any;
                    if (err2 !== null) {
                        callback(err2);
                        return;
                    }
                    else if (result.length !==1) {
                        callback(utils.errors.invalidObjId);
                        return;
                    }
                    else {
                        currentObj = result[0];
                        // Verify that the new list is consistent with the semantics of the object
                        self.checkObjectValidityForListUpdate(objType, currentObj, updateField, function (err3: Error): void {
                            if (err3 !== null) {
                                callback(err3);
                                return;
                            }
                            else {
                                // Coalesce the two lists currentObj.itemList and the incoming itemList, and update the obj
                                currentItemList = currentObj[PuzzleSeries.seriesItemTypeToFieldNameMap[itemType]];
                                listItemIds.forEach(function (item) {
                                    // Add it to the currentItemList if not there already
                                    if (currentItemList.lastIndexOf(item) === -1) {
                                        currentItemList.push(item);
                                    }
                                });

                                // Now update the item
                                updateField[PuzzleSeries.seriesItemTypeToFieldNameMap[itemType]] = currentItemList;
                                self.crudHandle.updateObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, { "_id": objId }, updateField, function (err4: Error, count: number) {
                                    if (err4 !== null) {
                                        callback(err4);
                                    }
                                    else {
                                        callback(null);
                                    }
                                });
                            }
                        });
                    }
                });                               
            }

        });        
    }

    // Remove given set of items from the given obj
    // Possible errors:
    //      "InvalidItemId"       "One or more invalid item ids"
    //      "InvalidObjId"         "Invalid object id"
    //      "PlayerNotOnTeam"       "One or more player is not part of the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    removeItemsFromObj(listItemIds: string[], itemType: string, objId: string, objType: string, callback: CallBackWithCount): void {
        var updateField: any,
            updatedItemList: any[],
            itemField: string = PuzzleSeries.seriesItemTypeToFieldNameMap[itemType],
            self = this;
        this.crudHandle.findObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, { "_id": objId }, { }, function (err2: Error, result: any[]) {
            if (err2 !== null) {
                callback(err2, 0);
                return;
            }
            else if (result.length !==1) {
                callback(utils.errors.invalidObjId, 0);
                return;
            }
            else {
                updatedItemList = result[0][itemField].filter(function (item) {
                    if (listItemIds.lastIndexOf(item) === -1) {
                        // item not present in the delete list,so should keep it
                        return true;
                    }
                    else {
                        return false;
                    }
                });

                // Now update the object
                updateField = {};
                updateField[itemField] = updatedItemList;
                self.crudHandle.updateObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, { "_id": objId }, updateField, function (err4: Error, count: number) {
                    if (err4 !== null) {
                        callback(err4, 0);
                    }
                    else {
                        callback(null, count);
                    }
                });
            }
        })
    }

    // Get a list of fields of objects of given SeriesObjectType meeting the select-query condition
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    findObj(objType: string /*SeriesObjectType*/, queryFields: any, fieldsReturned: any, callback: (err: Error, list: any[]) => void): void {
        // Check if objType is valid
        if (!PuzzleSeries.checkObjType(objType)) {
            utils.log(utils.getShortfileName(__filename) + " returning invalidObjType error with objType: " + objType);
            callback(utils.errors.invalidObjType, null);
            return;
        }

        //prune the fieldsReturned based on the role
        var prunedFieldsReturned = PuzzleSeries.pruneFields(fieldsReturned, objType, this.token.role);
        utils.log(" objType " + objType);
        utils.log(" soType " + PuzzleSeries.seriesObjTypeMap[objType]);
        utils.log(" collection " + PuzzleSeries.seriesObjTypeMap[objType].collectionName);
        this.crudHandle.findObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, queryFields, prunedFieldsReturned, function (innerErr: Error, objList: any[]) {
            callback(innerErr, objList);
        });        
    }

    // Set status of an event. 
    // Possible errors:
    //      "InvalidEventId"        "Invalid event id"
    //      "InvalidStatusChange"   "attemp to start an event already underway or ended OR attempt to end an event already ended"
    //      "InvalidEventChange"    "another event already active"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    setEventStatus(eventId: string, eventStatus: EventStatus, callback: SimpleCallBack): void {
        this.updateObj("events", eventId, { "status": eventStatus }, function (err: Error, count: number) {
            if (err) {
                callback(err);
            }
            else if (count !==1) {
                callback(utils.errors.inconsistentDB);
            }
            else {
                callback(null);
            }
        });
    }

    // Update the state of the given puzzle for the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInEvent"      "puzzle not assigned to the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    updatePuzzleState(teamID: string, puzzleID: string, puzzleStateSolved: string, callback: SimpleCallBack): void {
        var self = this, pzStateId, puzzleStateCollectionName, eventId /* TODO: which eventId to use? the one and only active event? */;

        //Figure out the eventId
        this.findObj(global.config.psdb.eventsCollectionName, { "status": "started", "active": true }, {}, function (err0: Error, eventList: any[]) {
            if (err0 !== null) {
                callback(err0);
            }
            else {
                // Confirm that only one event is active and is underway
                if (eventList === null || eventList.length !== 1) {
                    utils.log(" updatePuzzleState found zero or more than one events underway");
                    callback(utils.errors.inconsistentDB);
                }
                else {
                    eventId = eventList[0]._id;
                    //TODO: Need to confirm that the team and puzzle are part of the event
                    if (eventList[0].teamIds.lastIndexOf(teamID) === -1) {
                        callback(utils.errors.invalidteamId);
                    }
                    else if (eventList[0].puzzleIds.lastIndexOf(puzzleID) === -1) {
                        callback(utils.errors.invalidpuzzleId);
                    }
                    else {
                        // Now need to confirm that the puzzle was assigned to the team
                        self.crudHandle.findObj(global.config.psdb.teamsCollectionName, { "_id": teamID }, {},
                            function (err3: Error, teamsList: any[]) {
                                if (teamsList === null || teamsList.length !== 1) {
                                    // The teamId is not a valid one
                                    callback(utils.errors.invalidteamId);
                                }
                                else if (!teamsList[0].active || teamsList[0].puzzleIds.lastIndexOf(puzzleID) === -1) {
                                    // The puzzle is not assigned to the team
                                    callback(utils.errors.invalidpuzzleId);
                                }
                                else {
                                    pzStateId = PuzzleSeries.composePuzzleStateId(teamID, puzzleID);
                                    puzzleStateCollectionName = global.config.psdb.puzzleStatesCollectionNamePrefix + eventId;
                                    // Use upsert:true option so it will create a document with this id if it is already not present
                                    self.crudHandle.updateObj(puzzleStateCollectionName, { "_id": pzStateId }, { "_id": pzStateId, "teamId": teamID, "puzzleId": puzzleID, "solved": puzzleStateSolved },
                                        function (err1: Error, count: number) {
                                            if (err1) {
                                                // Something went wrong in the update!!
                                                callback(err1);
                                            }
                                            else {
                                                if (count < 1) {
                                                    // Something went wrong in the update!!
                                                    callback(utils.errors.inconsistentDB);
                                                }
                                                else {
                                                    // Success!!
                                                    callback(null);
                                                }
                                            }
                                        }, { upsert: true });
                                }
                            });
                    }
                }
            }
        });
    }
    //------------------ End PuzzleSeries interface methods ------------------
}
export = PuzzleSeries;
