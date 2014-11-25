//
//   MODULE: mongodbCRUD MODULE
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: mongodbCRUD.ts
//   DESCRIPTION: File containing the interface supported by the module that provides low level CRUD database capabilities over a mongodb server
//
//   HISTORY:
//     Date            By  Comment
//     2014 Oct 13th   TJ  Created
//     2014 Oct 4th    TJ  Added createDBHandleAsync api and implementation
/// <reference path="../../inc/ext/node.d.ts"/>
/// <reference path="../../inc/psdb.d.ts"/>
/// <reference path="../../inc/crud.d.ts"/>
/// <reference path="../../inc/ext/mongodb.d.ts"/>

// Implementation of DBCRUD module that uses a backing database on a mongodb server


import fs = require('fs');
import assert = require("assert");
import utils = require('../utils');
import mongodb = require('mongodb');

var mongodbModule: DBCRUDModule = {
    createDBHandleAsync: function (server: string, dbName: string, callback: (err: Error, dbcrud: DBCRUD) => void) {
        var uri = server + dbName;
        mongodb.MongoClient.connect(uri, function (err: Error, db: mongodb.Db) {
            if (err === null) {
                utils.log(utils.getShortfileName(__filename) + ": mongoDBCRUD: connected to database: " + dbName + " on server " + server);
                callback(null, new mongoDBCRUD(db));
            }
            else {
                utils.log(utils.getShortfileName(__filename) + ": mongoDBCRUD: connect to database (" + dbName + " ) on server " +
                    server + " failed: " + err.message);
                callback(err, null);
            }
        });
    },
    createDBHandle: function (server: string, dbName: string) {
        return null;
    }

};
class mongoDBCRUD implements DBCRUD {

    private dbHandle: mongodb.Db;
    private listOfCollections: Array<string>;


    /// Function to check if all initial conditions are ok and if collection is non-null, check if it exists already 
    private checkAllOk = function (collection: string): Error {
        if (this.dbHandle === null) {
            utils.log(utils.getShortfileName(__filename) + "dbHandle is null");
            return utils.errors.inconsistentDB;
        }
        else {
            return null;
        }
    };
    constructor(dbHandle: mongodb.Db) {
        this.dbHandle = dbHandle;
    }

    // Insert a new document in the given collection
    public insertObj(collection: string, objMap: any, callback: (err: Error, obj: any) => void) {

        var checkerror = this.checkAllOk(collection);
        if (checkerror !== null) {
            callback(checkerror, null);
            return;
        }
        // collection exists. call insertObj on the collection object
        this.dbHandle.collection(collection).insert(objMap, function (err1: Error, result: any) {
            if (err1 !== null) {
                callback(err1, null);
            }
            else {
                assert.equal(result.length, 1);
                if (result.length !== 1) {
                    utils.log("Returning inconsistentDB error out of insertOb");
                    callback(utils.errors.inconsistentDB, null);
                }
                else {
                    callback(null, result[0]);
                }

            }
        });
    }

    // Find objects from the given collection
    public findObj(collection: string, findMap: any, projMap: any, callback: (err: Error, objList: any[]) => void) {
        var checkerror = this.checkAllOk(collection);
        if (checkerror !== null) {
            callback(checkerror, null);
            return;
        }
        this.dbHandle.collection(collection).find(findMap, projMap, function (err1: Error, result: mongodb.Cursor) {
            if (err1 !== null) {
                callback(err1, null);
            }
            else {
                result.toArray(function (err2: Error, retVal: any[]) {
                    if (err2 !== null) {
                        callback(err2, null);
                    }
                    else {
                        callback(null, retVal);
                    }
                });
            }
        });
    }


    // Update an existing document in the given collection 
    // Allowed set_map: {name: string, description: string, active: true/false, teamLead: string}
    // Additional allowed set_maps only for team collection: 
    //          {$addToSet: { players: { $each: [id1, id2, id3] } }
    //          {$pull: {playerid1, playerid2,..} //no multi-pull available
    // Additional allowed set_map only for event collection: 
    //          {$addToSet: { puzzles: { $each: [id1, id2, id3] } }
    //          {$pull: {puzzleid1, puzzleid2,..} //no multi-pull available
    public updateObj(collection: string, findMap: any, setMap: any, callback: CallBackWithCount) {
        var checkerror = this.checkAllOk(collection);
        if (checkerror !== null) {
            callback(checkerror, null);
            return;
        }
        this.dbHandle.collection(collection).update(findMap, { $set: setMap }, { safe: true, upsert: false, multi: false, fullResult: true }, function (err1, result: any) {
            if (err1 !== null) {
                callback(err1, 0);
            }
            else {
                callback(null, 1);
            }
        });
    }


    // Delete an object from given collection
    public deleteObj(collection: string, findMap: any, callback: CallBackWithCount) {
        var checkerror = this.checkAllOk(collection);
        if (checkerror !== null) {
            callback(checkerror, null);
            return;
        }
        this.dbHandle.collection(collection).remove(findMap, { safe: true, single: true }, function (err1, result: any) {
            if (err1 !== null) {
                callback(err1, 0);
            }
            else {
                callback(null, 1);
            }
        });

    }
}

export = mongodbModule;
