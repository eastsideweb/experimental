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


    //Helper function to retrieve the last known sequence from the document corresponding to the given collection from the counters collection which holds all the counters
    // The seqId returned is to be used as the _id field in insertObj method when _id is not specified by the caller.
    private getNextId(collection: string, callback: (err: Error, seq: number)=> void) {
        this.dbHandle.collection(global.config.psdb.countersCollectionName).findAndModify({ "_id": collection }, null, { $inc: { seq: 1 } }, { new: true }, function (err1: Error, result: any) {
            // Call the passed in callback with new seq
            if (err1 === null) {
                //console.log("************** result from findAndModify:" + JSON.stringify(result));
                callback(null, result.seq);
            }
            else {
                callback(err1, -1);
            }
        });
        return;
    }

    private fixQueryForObjectId(query: any) {
        var fixedQuery = query;
        if (global.config.psdb.useObjectID) {
            fixedQuery = {}
            // **WARNING** assuming only static fields coming in - otherwise we need to do a deep copy
            for (var prop in query) {
                // Check the "_id" property and fix it
                if (query.hasOwnProperty(prop)) {
                    if (prop === "_id") {
                        fixedQuery[prop] = new mongodb.ObjectID(query[prop]);
                    }
                    else {
                        fixedQuery[prop] = query[prop];
                    }
                }
            }
        }
        return fixedQuery;
    }
    constructor(dbHandle: mongodb.Db) {
        this.dbHandle = dbHandle;
    }

    // Insert a new document in the given collection
    public insertObj(collection: string, objMap: any, callback: (err: Error, obj: any) => void) {

        var self = this, checkerror = this.checkAllOk(collection);
        if (checkerror !== null) {
            callback(checkerror, null);
            return;
        }
        // collection exists. call insertObj on the collection object

        // First check if _id was specified in the objMap, if not, create a unique one using the helper function getNextId
        if (objMap._id !== null && objMap._id !== undefined) {
            this.insertObjInternal(collection, objMap, callback);
        }
        else {
            //console.log("**************calling getNextId for collection: " + collection);
            this.getNextId(collection, function (err1: Error, seq: number) {
                if (err1 !== null) {
                    //console.log("**************got error : " + err1);
                    callback(err1, null);
                }
                else {
                    //console.log("**************got seq : " + seq);
                    objMap._id = collection + seq.toString();
                    self.insertObjInternal(collection, objMap, callback);
                }
            });
        }
    }
    private insertObjInternal(collection: string, objMap: any, callback: (err: Error, obj: any) => void) {
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
    public updateObj(collection: string, findMap: any, setMap: any, callback: CallBackWithCount, options?: any) {
        var upsertOptionValue: boolean, checkerror = this.checkAllOk(collection);
        if (checkerror !== null) {
            callback(checkerror, null);
            return;
        }
        // Check if options are specified, and if upsert is included.
        upsertOptionValue = (options !== null && options !== undefined && options.upsert !== undefined)? options.upsert : false;
        this.dbHandle.collection(collection).update(findMap, { $set: setMap }, { safe: true, upsert: upsertOptionValue, multi: false, fullResult: true }, function (err1, result: any) {
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
