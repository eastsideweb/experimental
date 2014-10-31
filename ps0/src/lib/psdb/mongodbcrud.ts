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
// 
/// <reference path="../../inc/ext/node.d.ts"/>
/// <reference path="../../inc/psdb.d.ts"/>
/// <reference path="../../inc/crud.d.ts"/>
/// <reference path="../../inc/ext/mongodb.d.ts"/>

// Implementation of DBCRUD module that uses a backing database on a mongodb server


import fs = require('fs');
import assert = require("assert");
import utils = require('../utils');
import mongodb = require('mongodb');
class mongoDBCRUD implements DBCRUD {

    private server: string;
    private dbName: string;
    private mongoClient: mongodb.MongoClient;
    private dbHandle: mongodb.Db;
    public handleToDataBase: any;
    private connectionErr: Error;
    private listOfCollections: Array<string>;


    /// Function to check if all initial conditions are ok and if collection is non-null, check if it exists already 
    private checkAllOk = function (collection: string): Error {
        if (this.connectionErr === null && this.dbHandle == null) {
            utils.log(utils.getShortfileName(__filename) + "we are in ServerNotReady mode");
            return utils.errors.serverNotReady;
        }
        else if (collection !== null && this.listOfCollections != null && this.listOfCollections.indexOf(collection) < 0) {
            utils.log(utils.getShortfileName(__filename) + " collection not found: " + collection);
            return utils.errors.inconsistentDB;
        }
        else {
            utils.log(utils.getShortfileName(__filename) + " checkAllOK returning success for collection: " + collection);
            return null;
        }
    };
    constructor(server: string, dbName: string) {
        var self = this, uri;
        this.server = server;
        this.dbName = dbName;
        this.dbHandle = null;
        this.connectionErr = null;
        utils.log(utils.getShortfileName(__filename)  + "server = " + server + "dbName " + dbName);
        uri = server + self.dbName;
        // Create a dbHandle to the database on the server
        mongodb.MongoClient.connect(uri, function (err: Error, db: mongodb.Db) {
            if (err === null) {
                // save the dbhandle
                utils.log(utils.getShortfileName(__filename)  + ": mongoDBCRUD: connected to database: " + self.dbName);
                self.dbHandle = db;
                // We will cache the existing collectionNames to begin with, so we don't add a new collection to the database, through the CRUD apis
                db.collectionNames("", { "namesOnly": true }, function (err1: Error, result: Array<string>) {
                    if (err1 === null) {
                        //Save the result
                        self.listOfCollections = result;
                    }
                    else {
                        utils.log(utils.getShortfileName(__filename)  + ": mongoDBCRUD: failed to get collections array: " + err1.message);
                        // Review: should we fail if error is returned?
                        //self.connectionErr = err1;
                        //self.dbHandle = null;
                    }
                });
            }
            else {
                utils.log(utils.getShortfileName(__filename) + ": mongoDBCRUD: connect to database failed: " + err.message);
                self.connectionErr = err;
                self.dbHandle = null;
            }
        });

    }

    // Insert a new document in the given collection
    public insertObj(collection: string, objMap: any, callback: (err: Error, obj: any) => void) {

        var checkerror = this.checkAllOk(collection);
        if (checkerror !== null) {
            callback(checkerror, null);
            return;
        }
        // collection exists. call insertObj on the collection object
        this.dbHandle.collection(collection).insert(objMap, callback);
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
        this.dbHandle.collection(collection).update(findMap, setMap, { safe: true, upsert: false, multi: false }, function (err1, result: any) {
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

export = mongoDBCRUD;
