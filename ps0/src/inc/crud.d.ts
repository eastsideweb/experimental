//
//   MODULE: DBCRUD
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: crud.d.ts
//   DESCRIPTION: File containing the interface supported by the module that provides low level CRUD database capabilities
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 5th    TJ  Created
// 

// Typical use of this object will be 
// var dbCRUD = require('DBCRUD').createDBHandle('server', 'dbName');
interface DBCRUDModule {
    createDBHandle(server: string, dbName: string): DBCRUD;
}

interface DBCRUD {

    // /*Testing purpose*/
    // Allowed collection strings:
    //  all SeriesObjectTypes / eventPuzzleStates* 

    // Insert a new document in the given collection
    // Allowed objMap cannot have _id. Could have name, description, active, status, teamLead, players[], puzzles[]
    insertObj(collection: string, objMap: any, callback: (err: Error, obj: any) => void): void;

    // Find objects from the given collection
    // Allowed collection strings:
    //  PuzzleSeriesInfo/all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed find_map: {_id: string, name: string}
    findObj(collection: string, findMap: any, projMap: any, callback: (err: Error, objList: any[]) => void): void;


    // Update an existing document in the given collection 
    // Allowed find_map: {_id: stringps
    // Allowed collection strings:
    //  all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed set_map: {name: string, description: string, active: true/false, teamLead: string}
    // Additional allowed set_maps only for team collection: 
    //          {$addToSet: { players: { $each: [id1, id2, id3] } }
    //          {$pull: {playerid1, playerid2,..} //no multi-pull available
    // Additional allowed set_map only for event collection: 
    //          {$addToSet: { puzzles: { $each: [id1, id2, id3] } }
    //          {$pull: {puzzleid1, puzzleid2,..} //no multi-pull available
    updateObj(collection: string, findMap: any, setMap: any, callback: CallBackWithCount): void;

    // Delete an object from given collection
    // Allowed collection strings:
    // all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed findMap: {_id: string}
    deleteObj(collection: string, findMap: any, callback: CallBackWithCount): void;

    handleToDataBase?: any;
}
 