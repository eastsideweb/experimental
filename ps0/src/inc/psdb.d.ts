// Describes interfaces implemented by PSDB library objects
interface SeriesInfo {
    name: string;
    id: string;
    description: string;
}

interface PSDBCallBack {
    (err: PSDBError): void;
}

interface PSDBError extends Error {

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
    findSeries(queryFields: any, /* fieldsReturned: any, */callback: (err: PSDBError, list: Array<SeriesInfo>) => void): void;

    // Function to get a token that represents access to the series object for a given series id, with previliges appropriate 
    // for the given "role". The credentials provided should have the given role previliges
    // Current Supported roles: 'administrator', 'instructor', 'player'
    // Possible errors: 
    //      "InvalidSeriesId"           "series id not found"
    //      "InvalidRoleType"           "Invalid role"
    //      "InvalidCredentials"        "Invalid credentials"
    //      "RoleNotSupportedForUser"   "User not authorized for role" 
    getSeriesToken(id: string, role: RoleType, credentials: Credentials, callback: (err: PSDBError, token: string) => void): void;

    // Function to release a token that was previously obtained using getSeriesToken api
    // Possible errors: 
    //      "InvalidTokenId"    "Invalid token"
    releaseSeriesToken(token: string, callback: PSDBCallBack): void;

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
    activate(objType: SeriesObjectType, objId: string, callback: PSDBCallBack): void;
    deactivate(objType: SeriesObjectType, objId: string, callback: PSDBCallBack): void;

    // Update static fields of a given object from the given SeriesObjectType collection having given objId
    // Possible err:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    update(objType: SeriesObjectType, objId: string, updateFields: any, callback: (err: PSDBError, updateCount: number) => void): void;

    // Add a new object of given type
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "EmptyName"             "name field missing"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    add(objType: SeriesObjectType, objInfo: any, callback: (err: PSDBError, objInfo: SeriesObject) => void): void;

    // Delete an object with given object id from the series
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "InvalidObjId"          "Invaid object id"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    delete(objType: SeriesObjectType, objInfo: any, callback: (PSDBError, updateCount: number) => void): void;

    // Add given set of players to the given team
    // Possible errors:
    //      "InvalidPlayerId"       "One or more invalid player ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PlayerNotActive"       "One or more player is deactivate"
    //      "PlayerOnAnotherTeam"   "One or more player is already part of another team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    addPlayersToTeam(listPlayerIds: string[], teamId: string, callback: PSDBCallBack): void;

    // Remove given set of players from the given team
    // Possible errors:
    //      "InvalidPlayerId"       "One or more invalid player ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PlayerNotOnTeam"       "One or more player is not part of the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    removePlayersFromTeam(listPlayerIds: string[], teamId: string, callback: (PSDBError, updateCount: number) => void): void;

    // Get a list of fields of objects of given SeriesObjectType meeting the select-query condition
    // Possible errors:
    //      "InvalidObjType"        "Invalid object type"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    find(objType: SeriesObjectType, queryFields: any, fieldsReturned: any, callback: (err: PSDBError, list: any[]) => void): void;

    // Set status of an event. 
    // Possible errors:
    //      "Invalid event id"
    //      "event already started"
    //      "another event already active"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    setEventStatus(eventId: string, eventStatus: EventStatus, callback: PSDBCallBack): void;

    // Assign given set of puzzles to the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInEvent"      "One or more puzzles not part of the current event"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    assignPuzzlesToTeam(listPuzzleIds: string[], teamId: string, callback: PSDBCallBack): void;

    // Remove given set of puzzles from the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInTeam"       "One or more puzzles not assigned to the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    removePuzzlesFromTeam(listPuzzleIds: string[], teamId: string, callback: PSDBCallBack): void;

    // Update the state of the given puzzle for the given team
    // Possible errors:
    //      "InvalidPuzzleId"       "One or more invalid puzzle ids"
    //      "InvalidTeamId"         "Invalid team id"
    //      "PuzzleNotInEvent"      "puzzle not assigned to the team"
    //      "UnauthorizedAccess"    "Access to this api not supported for the RoleType"
    updatePuzzleState(teamID: string, puzzleID: string, puzzleState: any, callback: PSDBCallBack): void;

}

// Interface supported by the CRUD module that the PuzzleSeries object uses to perform all the database operations
// Typical use of this object will be 
// var psdbCRUD = require('PSDBCRUD').createDBHandle('mongoserver', 'mongodb');
interface PSDBCRUDModule {
    createDBHandle(server: string, dbName: string): PSDBCRUD;
}

interface PSDBCRUD {

    // /*Testing purpose*/
    // Allowed collection strings:
    //  all SeriesObjectTypes / eventPuzzleStates* 

    // Insert a new document in the given collection
    // Allowed objMap cannot have _id. Could have name, description, active, status, teamLead, players[], puzzles[]
    insertObj(collection: string, objMap: any, callback: (err: PSDBError, obj: any) => void): void;

    // Find objects from the given collection
    // Allowed collection strings:
    //  PuzzleSeriesInfo/all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed find_map: {_id: string, name: string}
    findObj(collection: string, findMap: any, projMap: any, callback: (err: PSDBError, objList: any[]) => void): void;


    // Update an existing document in the given collection 
    // Allowed find_map: {_id: string}
    // Allowed collection strings:
    //  all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed set_map: {name: string, description: string, active: true/false, teamLead: string}
    // Additional allowed set_maps only for team collection: 
    //          {$addToSet: { players: { $each: [id1, id2, id3] } }
    //          {$pull: {playerid1, playerid2,..} //no multi-pull available
    // Additional allowed set_map only for event collection: 
    //          {$addToSet: { puzzles: { $each: [id1, id2, id3] } }
    //          {$pull: {puzzleid1, puzzleid2,..} //no multi-pull available
    updateObj(collection: string, findMap: any, setMap: any, callback: (PSDBError, updateCount: number) => void): void;

    // Delete an object from given collection
    // Allowed collection strings:
    // all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed findMap: {_id: string}
    deleteObj(collection: string, findMap: any, callback: (err: PSDBError, deleteCount: number) => void): void;
}
