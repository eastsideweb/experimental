//
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

import fs = require('fs');
import assert = require("assert");
import utils = require('../utils');
class fakeDB implements DBCRUD {

    private server: string;
    private dbName: string;
    public handleToDataBase: any;
    private lastIndex = {};

    private readFakeDatabase = function (fakeDBFilename): void {
        if (fs.existsSync(fakeDBFilename)) {
            utils.log(utils.getShortfileName(__filename) + " file found " + fakeDBFilename);
            this.handleToDataBase = JSON.parse(fs.readFileSync(fakeDBFilename, 'utf8'));
        }
        else {
            this.handleToDataBase = {
                "seriesInfoCollection":
                [
                    { "name": "HC Test Series1", "_id": "testSeriesId1", "description": "description for test series 1" },
                    { "name": "HC Test Series2", "_id": "testSeriesId2", "description": "description for test series 2" }
                ]
            }
       }
    }
    static checkInDebug = function (): boolean {
        return (global.config && global.config.psdb.useFakeDB === true);
    };
    constructor(server: string, dbName: string) {
        var fakeDBFilename;
        this.server = server;
        this.dbName = dbName;
        utils.log("server = " + server + "dbName " + dbName);
        fakeDBFilename = __dirname + "/" + dbName + ".json";
        this.readFakeDatabase(fakeDBFilename);
    }
    // /*Testing purpose*/
    // Allowed collection strings:
    //  all SeriesObjectTypes / eventPuzzleStates* 

    // Insert a new document in the given collection
    // Allowed objMap cannot have _id. Could have name, description, active, status, teamLead, players[], puzzles[]
    public insertObj(collection: string, objMap: any, callback: (err: Error, obj: any) => void) {
        if (!fakeDB.checkInDebug()) {
            callback(utils.errors.notInDebug, null);
            return;
        }
        // Check if the handleToDataBase has this collection, 
        utils.log(utils.getShortfileName(__filename) + " collection requested " + collection);
        utils.log("collection = " + this.handleToDataBase[collection]);

        if (!this.handleToDataBase[collection]) {
            utils.log(utils.getShortfileName(__filename) + " collection not found: " + collection);
            callback(utils.errors.notImpl, null);
        }
        //insert data into collection
        if (this.lastIndex[collection] === undefined) {
            this.lastIndex[collection] = 1;
        }
        objMap._id = collection + "Id" + this.lastIndex[collection];
        this.lastIndex[collection]++;

        this.handleToDataBase[collection].push(objMap);
        // TODO: create a new object by doing a deep copy before returning it
        callback(null, objMap);
    }

    // Find objects from the given collection
    // Allowed collection strings:
    //  PuzzleSeriesInfo/all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed find_map: {_id: string, name: string}
    public findObj(collection: string, findMap: any, projMap: any, callback: (err: Error, objList: any[]) => void) {
        if (!fakeDB.checkInDebug()) {
            callback(utils.errors.notInDebug, null);
            return;
        }

        // Check if the handleToDataBase has this collection, 
        utils.log(utils.getShortfileName(__filename) + " collection requested " + collection);
        utils.log("collection = " + this.handleToDataBase[collection]);

        if (!this.handleToDataBase[collection]) {
            utils.log(utils.getShortfileName(__filename) + " collection not found: " + collection);
            callback(utils.errors.notImpl, null);
        }
        //return hardcoded data
        var retVal: any[] = this.handleToDataBase[collection];
        // Check if any query params were passed. Only "_id" & "name" are entertained for now
        if (findMap.name || findMap._id) {
            var prop: string = findMap._id ? "_id" : "name",
                found: boolean = false;
            utils.log(utils.getShortfileName(__filename) + " found property: " + prop);
            for (var i: number = 0; i < retVal.length && !found; i++) {
                if (retVal[i][prop] === findMap[prop]) {
                    utils.log(utils.getShortfileName(__filename) + " found item: " + retVal[i][prop]);
                    retVal = retVal.slice(i, i + 1);
                    found = true;
                }
            }
            if (!found) {
                retVal = [];
            }
            else {
                assert(retVal.length === 1);
            }
        }
        setTimeout(callback(null,retVal), 100);
    }


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
    public updateObj(collection: string, findMap: any, setMap: any, callback: CallBackWithCount) {
        var updateObj;
        if (!fakeDB.checkInDebug()) {
            callback(utils.errors.notInDebug, null);
            return;
        }
        // Check if the handleToDataBase has this collection, 
        utils.log(utils.getShortfileName(__filename) + " collection requested " + collection);
        utils.log("collection = " + this.handleToDataBase[collection]);

        if (!this.handleToDataBase[collection]) {
            utils.log(utils.getShortfileName(__filename) + " collection not found: " + collection);
            callback(utils.errors.notImpl, null);
        }
        //update hardcoded data
        // Check if any query params were passed. Only "_id" & "name" are entertained for now
        if (findMap.name || findMap._id) {
            var prop: string = findMap._id ? "_id" : "name",
                found: boolean = false;
            utils.log(utils.getShortfileName(__filename) + " found property: " + prop);
            for (var i: number = 0; i < this.handleToDataBase[collection].length && !found; i++) {
                if (this.handleToDataBase[collection][i][prop] === findMap[prop]) {
                    updateObj = this.handleToDataBase[collection][i];
                    utils.log(utils.getShortfileName(__filename) + "updateObj: found item: " + this.handleToDataBase[collection][i].toString());
                    found = true;
                    for (var setProp in setMap) {
                        if (setMap.hasOwnProperty(setProp)) {
                            updateObj[setProp] = setMap[setProp];
                        }
                    }
                    utils.log(utils.getShortfileName(__filename) + "updateObj: found item: " + updateObj.toString());
                    utils.log(utils.getShortfileName(__filename) + "updateObj: updated item: " + this.handleToDataBase[collection][i].toString());
                }
            }
            if (found) {
                setTimeout(callback(null, 1), 100);
            }
            else {
                setTimeout(callback(utils.errors.inconsistentDB, 0), 100);
            }
            return;
        }
        setTimeout(callback(utils.errors.inconsistentDB, 0), 100);
    }


    // Delete an object from given collection
    // Allowed collection strings:
    // all SeriesObjectTypes / eventPuzzleStates* 
    // Allowed findMap: {_id: string}
    public deleteObj(collection: string, findMap: any, callback: CallBackWithCount) {
        if (!fakeDB.checkInDebug()) {
            callback(utils.errors.notInDebug, null);
            return;
        }
        callback(utils.errors.notImpl, 0);
    }
}

export = fakeDB;
 