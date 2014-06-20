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
// 
/// <reference path="../../inc/ext/node.d.ts"/>
/// <reference path="../../inc/psdb.d.ts"/>
/// <reference path="../../inc/crud.d.ts"/>
//  Contains the class that implements the PuzzleSeries interface

import crudmodule = require('./crudmodule');
import utils = require('../utils');


// Interface that describes the information relevant for a SeriesObjType
interface SeriesObjTypeInfo {
    // Schema for this object type
    schema: any;
    // Name of the collection in the series database that holds objects of this type 
    collectionName: string;
    // A map of role => array of properties that are allowed for that role
    allowedPropertiesMap: any
}

class PuzzleSeries implements IPuzzleSeries {
    private seriesId: string;
    private role: string;
    private credentials: ICredentials;

    // Begin static var/functions
    static initDone: boolean = false;
    // Map of schema for all allowed SeriesObjectTypes
    static seriesObjTypeMap: any = {
        'instructor':
        {
            schema: null,
            collectionName: global.config.psdb.instructorsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "state"],
                    "write": ["name", "description", "_id", ],
                },
                'player': {
                    "read": ["name", "description", "_id", "state"],
                    "write": [ ],
                }
            }
        },
        'event': {
            schema: null,
            collectionName: global.config.psdb.eventsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                    "write": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                },
                'player': {
                    "read": ["name", "description", "_id", "state"],
                    "write": [],
                }
            }
        },
        'puzzle': {
            schema: null,
            collectionName: global.config.psdb.puzzlesCollectionName,
            propertyAccessMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                    "write": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                },
                'player': {
                    "read": ["name", "description", "_id", "state"],
                    "write": [],
                }
            }
        },
        'team': {
            schema: null,
            collectionName: global.config.psdb.teamsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                    "write": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                },
                'player': {
                    "read": ["name", "description", "_id", "state"],
                    "write": [],
                }
            }
        },
        'player': {
            schema: null,
            collectionName: global.config.psdb.playersCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                    "write": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                },
                'player': {
                    "read": ["name", "description", "_id", "state"],
                    "write": [],
                }
            }
        },
        'annotation': {
            schema: null,
            collectionName: global.config.psdb.annotationsCollectionName,
            allowedPropertyMap: {
                'administrator': {
                    "read": "unrestricted",
                    "write": "unrestricted"
                },
                'instructor': {
                    "read": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                    "write": ["name", "description", "_id", "state", "status", "puzzleIds", "instructorIds", "teamIds"],
                },
                'player': {
                    "read": ["name", "description", "_id", "state"],
                    "write": [],
                }
            }
        },
    };

    static loadSchema = function (schema_path) {
    };

    static initializeObjTypeMap = function () {
        var objType, schema_path;
        if (PuzzleSeries.initDone)
            return;
        //for (objType in puzzleSeries.seriesObjTypeMap) {
        //    if (puzzleSeries.seriesObjTypeMap.hasOwnProperty(objType)) {
        //        puzzleSeries.loadSchema("filename");
        //    }
        //}
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
    // End static var/functions


    constructor(public token: IToken, public crudHandle: DBCRUD) {
        if (!PuzzleSeries.initDone) {
            PuzzleSeries.initializeObjTypeMap();
        }
    }

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
    updateObj(objType: string /*SeriesObjectType*/, objId: string, updateFields: any, callback: CallBackWithCount): void { }

    // Add a new object of given type
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "EmptyName"             "name field missing"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    addObj(objType: string /*SeriesObjectType*/, objInfo: any, callback: (err: Error, objInfo: ISeriesObject) => void): void {
        //TODO: validate the schema
    }

    // Delete an object with given object id from the series
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    deleteObj(objType: string /*SeriesObjectType*/, objInfo: any, callback: CallBackWithCount): void { }

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
    updatePuzzleState(teamID: string, puzzleID: string, puzzleState: any, callback: SimpleCallBack): void { }
    //------------------ End PuzzleSeries interface methods ------------------
}
export = PuzzleSeries;
