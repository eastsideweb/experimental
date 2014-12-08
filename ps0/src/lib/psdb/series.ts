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
                obj.status = "notStarted";
                obj.puzzleIds = [];
                obj.playerIds = [];
                obj.instructorIds = [];
                obj.teamIds = [];
                return obj;
            },

        },
        'puzzles': {
            collectionName: global.config.psdb.puzzlesCollectionName,
            propertyAccessMap: {
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
        if (PuzzleSeries.initDone)
            return;
        PuzzleSeries.jsonValidator = new validator(["annotations", "events", "instructors", "players", "puzzleStates", "series", "teams"]);
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
        var fixedObj = {};
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
        // Make sure the object is marked non-active
        fixedObj["active"] = false;
        fixedObj["description"] = fixedObj["description"] || "";

        utils.log("*********** " + utils.getShortfileName(__filename) + "after fixing " + JSON.stringify(fixedObj));
        return fixedObj;
    }

    static checkObjForUpdate = function (objInfo, writePermission): boolean {
        if (writePermission === "unrestricted")
            return true;
        for (var prop in objInfo) {
            // Allow only the properties that are allowed by write permission
            if (!writePermission[prop]) {
                return false;
            }
        }
        return true;
    }


    static composePuzzleStateId = function (teamId: string, puzzleId: string) {
        return "puzzleStateId_" + teamId + "_" + puzzleId;
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
    checkObjectValidity(objType: string /*SeriesObjectType*/, currentObj: any, updateFields, callback: SimpleCallBack): void {
        var err: Error = { name: "InvalidUpdate", message: "" };
        switch (objType) {
            case "events":
                if (updateFields.status) {
                    // Make sure the update of the status is valid: notStarted -> started -> ended
                    if (currentObj.status === "ended" ||
                        (currentObj.status === "notStarted" && updateFields.status !== "started") ||
                        (currentObj.status === "started" && updateFields.status !== "ended")) 
                    {
                        err.message = "Events: status update is invalid";
                        callback(err);
                        return;
                    }
                }
                break;
            case "teams":
                if (updateFields.teamLeadId) {
                    // Make sure the provided teamLeadId is a valid id and that the player is already part of the team
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
    // end utility methods

    //------------------ Begin PuzzleSeries interface methods ------------------
    // Activate/Deactivate a given object from the given SeriesObjectType collection having given objId
    // when the objType is "event", activate will also mark start of that event and deactivate will mark end of that event
    // Possible err:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    activate(objType: string /*SeriesObjectType*/, objId: string, callback: SimpleCallBack): void { }
    deactivate(objType: string /*SeriesObjectType*/, objId: string, callback: SimpleCallBack): void { }

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

        if (writePermission != "unrestricted" && (Array.isArray(writePermission) && writePermission.length === 0)) {
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
                    if (objList.length != 1) {
                        callback(utils.errors.inconsistentDB, 0);
                    }
                    else {
                        self.checkObjectValidity(objType, objList[0], updateFields, function (innererr2: Error) {
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

        if (writePermission != "unrestricted" && (Array.isArray(writePermission) && writePermission.length === 0)) {
            callback(utils.errors.UnauthorizedAccess, null);
            return;
        }

        self.crudHandle.deleteObj(PuzzleSeries.seriesObjTypeMap[objType].collectionName, objInfo, function (innerErr2: Error, count: number) {
            if (innerErr2 != null) {
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

    // Add given set of players to the given team
    // Possible errors:
    //      "InvalidPlayerId"       "One or more invalid player ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PlayerNotActive"       "One or more player is deactivate"
    //      "PlayerOnAnotherTeam"   "One or more player is already part of another team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    addPlayersToTeam(listPlayerIds: string[], teamId: string, callback: SimpleCallBack): void { }

    // Remove given set of players from the given team
    // Possible errors:
    //      "InvalidPlayerId"       "One or more invalid player ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PlayerNotOnTeam"       "One or more player is not part of the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    removePlayersFromTeam(listPlayerIds: string[], teamId: string, callback: CallBackWithCount): void { }

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
    setEventStatus(eventId: string, eventStatus: EventStatus, callback: SimpleCallBack): void { }

    // Assign given set of puzzles to the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInEvent"      "One or more puzzles not part of the current event"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    assignPuzzlesToTeam(listPuzzleIds: string[], teamId: string, callback: SimpleCallBack): void { }

    // Remove given set of puzzles from the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInTeam"       "One or more puzzles not assigned to the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    removePuzzlesFromTeam(listPuzzleIds: string[], teamId: string, callback: SimpleCallBack): void { }

    // Update the state of the given puzzle for the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInEvent"      "puzzle not assigned to the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    updatePuzzleState(teamID: string, puzzleID: string, puzzleState: any, callback: SimpleCallBack): void {
        var self = this, pzStateId, puzzleStateCollectionName, eventId /* TODO: which eventId to use? the one and only active event? */;

        //Figure out the eventId
        pzStateId = PuzzleSeries.composePuzzleStateId(teamID, puzzleID);
        puzzleStateCollectionName = global.config.psdb.puzzleStatesCollectionNamePrefix + eventId;
        //Check if such an item exists in the db - if so, we will update the state else
        this.crudHandle.findObj(puzzleStateCollectionName, { "_id": pzStateId }, {}, function (err: Error, objList: any[]) {
            if (err) {
                callback(err);
            }
            else {
                if (objList && objList.length === 1) {
                    // Found the item with the given  team & puzzle id. Just update the state
                    self.crudHandle.updateObj(puzzleStateCollectionName, { "_id": pzStateId }, { "solved": puzzleState }, function (err1: Error, count: number) {
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
                    });
                }
                else {
                    // No item found with the given team & puzzle id. Add a new item
                    self.crudHandle.insertObj(puzzleStateCollectionName, { "_id": pzStateId, "teamId": teamID, "puzzleId": puzzleID, "solved": puzzleState },
                        function (err2: Error, obj: any) {
                            if (err2) {
                                callback(err2);
                            }
                            else {
                                // Success!!
                                callback(null);
                            }
                        });
                }
            }
        });
    }
    //------------------ End PuzzleSeries interface methods ------------------
}
export = PuzzleSeries;
