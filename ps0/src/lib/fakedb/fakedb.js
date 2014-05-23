﻿//
//   MODULE: fakeDB MODULE
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: fakedb.ts
//   DESCRIPTION: File containing the interface supported by the module that provides low level CRUD database capabilities
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 12th   TJ  Template Created
//
/// <reference path="../../inc/ext/node.d.ts"/>
/// <reference path="../../inc/psdb.d.ts"/>
/// <reference path="../../inc/crud.d.ts"/>
// fake implementation of DBCRUD module that doesnt use any backing database.
// Strictly used for testing purposes only
var fs = require('fs');

//TODO: create a list of canned errors
var psdb_err_notimpl = {
    name: 'NOTIMPLEMENTED',
    message: 'Method not implemented yet'
};
var psdb_err_notInDebug = {
    name: 'NOTINDEBUG',
    message: 'Debug method called while not in debug mode'
};

var fakeDB = (function () {
    function fakeDB(server, dbName) {
        this.readFakeDatabase = function () {
            var fakeDBFilename = __dirname + "/fakeDatabase.json";
            if (fs.existsSync(fakeDBFilename)) {
                this.fakeDataBase = JSON.parse(fs.readFileSync(fakeDBFilename, 'utf8'));
            } else {
                this.fakeDataBase = {
                    "seriesInfoCollection": [
                        { "name": "HC Test Series1", "id": "testSeriesId1", "description": "description for test series 1" },
                        { "name": "HC Test Series2", "id": "testSeriesId2", "description": "description for test series 2" }
                    ]
                };
            }
        };
        this.server = server;
        this.dbName = dbName;
        this.readFakeDatabase();
    }
    // /*Testing purpose*/
    // Allowed collection strings:
    //  all SeriesObjectTypes / eventPuzzleStates*
    // Insert a new document in the given collection
    // Allowed objMap cannot have _id. Could have name, description, active, status, teamLead, players[], puzzles[]
    fakeDB.prototype.insertObj = function (collection, objMap, callback) {
        if (!fakeDB.checkInDebug()) {
            callback(psdb_err_notInDebug, null);
            return;
        }
        callback(psdb_err_notimpl, null);
    };

    // Find objects from the given collection
    // Allowed collection strings:
    //  PuzzleSeriesInfo/all SeriesObjectTypes / eventPuzzleStates*
    // Allowed find_map: {_id: string, name: string}
    fakeDB.prototype.findObj = function (collection, findMap, projMap, callback) {
        //console.log(__filename + " findObj reached with " + "c: " + collection);// + ",s: " + psdb.config.seriesInfoCollectionName);
        if (!fakeDB.checkInDebug()) {
            callback(psdb_err_notInDebug, null);
            return;
        }

        // Check if the collection name is a special one
        if (collection == global.config.psdb.seriesInfoCollectionName) {
            // We will return hardcoded seriesInfo
            //console.log(__filename + " findObj: " + retVal.seriesInfoList);
            setTimeout(callback(null, this.fakeDataBase.seriesInfoCollection), 1000);
        } else {
            console.log(__filename + " Non-series object requested");
            callback(psdb_err_notimpl, null);
        }
    };

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
    fakeDB.prototype.updateObj = function (collection, findMap, setMap, callback) {
        if (!fakeDB.checkInDebug()) {
            callback(psdb_err_notInDebug, null);
            return;
        }
        callback(psdb_err_notimpl, 0);
    };

    // Delete an object from given collection
    // Allowed collection strings:
    // all SeriesObjectTypes / eventPuzzleStates*
    // Allowed findMap: {_id: string}
    fakeDB.prototype.deleteObj = function (collection, findMap, callback) {
        if (!fakeDB.checkInDebug()) {
            callback(psdb_err_notInDebug, null);
            return;
        }
        callback(psdb_err_notimpl, 0);
    };
    fakeDB.checkInDebug = function () {
        return (global.config && global.config.Debug == true);
    };
    return fakeDB;
})();

module.exports = fakeDB;
//# sourceMappingURL=fakedb.js.map
