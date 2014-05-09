//
//   MODULE: PSDB 
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdb.d.ts
//   DESCRIPTION: File containing the main psdb interface used by the server
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 5th    TJ  Created
//
//

// Describes interfaces implemented by PSDB library objects
interface SeriesInfo {
    name: string;
    id: string;
    description: string;
}

interface SimpleCallBack {
    (err: Error): void;
}

interface CallBackWithCount {
    (err: Error, count: number): void;
}

declare enum SeriesObjectType {
    'instructor',
    'puzzle',
    'team',
    'player',
    'annotation'
}

declare enum EventStatus {
    'notStarted',
    'started',
    'ended'
}
// Common fields expected of all Series Objects
interface SeriesObject {
    name: string;
    id: string;
    description: string;
    active: boolean;
}
declare enum RoleType {
    'administrator',
    'instructor',
    'player'
}
//Interface defining the credential information coming over the wire from the web client
interface Credentials {
    userName: string;
    password: string;
}

// Interface that the main PuzzleSeriesDatabase (psdb) object needs to implement.
// Typically you will get this object through the require call: var psdb: PSDB = require('./psdb');
interface PSDB {
    // A function that returns a list of objects for a given objtype.
    // No authentication needed
    // queryFields - the select clauses to get a subset of SeriesInfo objects
    // REVIEW: Removing this projection argument cause we want keep the SeriesInfo type specification. 
    // fieldsReturned - the projection that identifies 
    findSeries(queryFields: any, /* fieldsReturned: any, */callback: (err: Error, list: Array<SeriesInfo>) => void): void;

    // Function to get a token that represents access to the series object for a given series id, with previliges appropriate 
    // for the given "role". The credentials provided should have the given role previliges
    // Current Supported roles: 'administrator', 'instructor', 'player'
    // Options provide any options that are to be set for this particular session e.g. {debug: true}
    // Possible errors: 
    //      "InvalidSeriesId"           "series id not found"
    //      "InvalidRoleType"           "Invalid role"
    //      "InvalidCredentials"        "Invalid credentials"
    //      "RoleNotSupportedForUser"   "User not authorized for role" 
    getSeriesToken(id: string, role: RoleType, credentials: Credentials, options: any, callback: (err: Error, token: string) => void): void;

    // Function to release a token that was previously obtained using getSeriesToken api
    // Possible errors: 
    //      "InvalidTokenId"    "Invalid token"
    releaseSeriesToken(token: string, callback: SimpleCallBack): void;

    // Synchronous call to get a puzzleSeries object represented by given token (which was handed out earlier)
    // return value will be null if the token is invalid or has expired
    series(token: string): PuzzleSeries;
}

// Interface puzzleSeries that the series object needs to implement
// Many of the common APIs operate on given object type which are listed in SeriesObjectType enum
//
interface PuzzleSeries {
    // Activate/Deactivate a given object from the given SeriesObjectType collection having given objId
    // when the objType is "event", activate will also mark start of that event and deactivate will mark end of that event
    // Possible err:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    activate(objType: SeriesObjectType, objId: string, callback: SimpleCallBack): void;
    deactivate(objType: SeriesObjectType, objId: string, callback: SimpleCallBack): void;

    // Update static fields of a given object from the given SeriesObjectType collection having given objId
    // Possible err:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    updateObj(objType: SeriesObjectType, objId: string, updateFields: any, callback: CallBackWithCount): void;

    // Add a new object of given type
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "EmptyName"             "name field missing"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    addObj(objType: SeriesObjectType, objInfo: any, callback: (err: Error, objInfo: SeriesObject) => void): void;

    // Delete an object with given object id from the series
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    deleteObj(objType: SeriesObjectType, objInfo: any, callback: CallBackWithCount): void;

    // Add given set of players to the given team
    // Possible errors:
    //      "InvalidPlayerId"       "One or more invalid player ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PlayerNotActive"       "One or more player is deactivate"
    //      "PlayerOnAnotherTeam"   "One or more player is already part of another team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    addPlayersToTeam(listPlayerIds: string[], teamId: string, callback: SimpleCallBack): void;

    // Remove given set of players from the given team
    // Possible errors:
    //      "InvalidPlayerId"       "One or more invalid player ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PlayerNotOnTeam"       "One or more player is not part of the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    removePlayersFromTeam(listPlayerIds: string[], teamId: string, callback: CallBackWithCount): void;

    // Get a list of fields of objects of given SeriesObjectType meeting the select-query condition
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    findObj(objType: SeriesObjectType, queryFields: any, fieldsReturned: any, callback: (err: Error, list: any[]) => void): void;

    // Set status of an event. 
    // Possible errors:
    //      "InvalidEventId"        "Invalid event id"
    //      "InvalidStatusChange"   "attemp to start an event already underway or ended OR attempt to end an event already ended"
    //      "InvalidEventChange"    "another event already active"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    setEventStatus(eventId: string, eventStatus: EventStatus, callback: SimpleCallBack): void;

    // Assign given set of puzzles to the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInEvent"      "One or more puzzles not part of the current event"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    assignPuzzlesToTeam(listPuzzleIds: string[], teamId: string, callback: SimpleCallBack): void;

    // Remove given set of puzzles from the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInTeam"       "One or more puzzles not assigned to the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    removePuzzlesFromTeam(listPuzzleIds: string[], teamId: string, callback: SimpleCallBack): void;

    // Update the state of the given puzzle for the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInEvent"      "puzzle not assigned to the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    updatePuzzleState(teamID: string, puzzleID: string, puzzleState: any, callback: SimpleCallBack): void;

}
