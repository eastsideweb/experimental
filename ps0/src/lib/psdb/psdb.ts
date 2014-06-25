//
//   MODULE: PSDB
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdb.ts
//   DESCRIPTION: File containing the main psdb module 
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 5th    TJ  Created
// 
/// <reference path="../../inc/ext/node.d.ts"/>
/// <reference path="../../inc/psdb.d.ts"/>
/// <reference path="../../inc/crud.d.ts"/>
// Main psdb node module that implements the PSDB interface

"use strict";

import http = require('http');
import assert = require('assert');
import crudmodule = require('./crudmodule');
import utils = require('../utils');
import PuzzleSeries = require('./series');

class Token implements IToken {
    constructor(public seriesId: string, public database: string, public role: string, public credentials: ICredentials) {
        this.tokenString = Token.createUniqueToken(seriesId, role, credentials.userName);
        this.creationTime = Date.now();
    }
    public tokenString: string;
    private creationTime;
    static tokenIndex: number = 0;
    static createUniqueToken(seriesId: string, role: string, name: string): string {
        var retval;
        if (global.config.Debug) {
            retval = Token.tokenIndex + '-' + seriesId + '-' + role + '-' + name;
        }
        else {
            var t = Math.floor(Math.random() * 1000).toString();
            var d = new Date();
            retval = Token.tokenIndex + "-" + t + "-" + seriesId + "-" + d.getMilliseconds().toString();
        }
        Token.tokenIndex += Math.floor(Math.random() * 10);
        return retval;
    }

    // Check if this token is still valid based on when it was created and the current time
    public isValid(): boolean {
        var currentTime = Date.now();
        utils.log(" config tolerence= " + global.config.psdb.tokenValidityTolerence);
        var tolerence = global.config.psdb.tokenValidityTolerence || /* one day - 24 * 60 * 60 * 1000*/ 86400000;
        utils.log("creation: " + this.creationTime + " current: " + currentTime + " tolerence: " + tolerence);
        return (currentTime - this.creationTime < tolerence);
    }

}


var infoDBcrud: DBCRUD,
    roleTypes = {
        'administrator': 'administrator',
        'instructor': 'instructor',
        'player': 'player'
    },
    tokenMap = {}, // Map of token string to the corresponding IToken object and the crudHandle to the series database
    env = process.env.NODE_ENV || "ENV_NOT_FOUND";

//----------- Begin Initialization

console.log("Started psdb module in " + env + " ... ");

infoDBcrud = crudmodule.createDBHandle(global.config.psdb.serverName, global.config.psdb.infoDBName);

//----------- End Initialization

var psdb: IPSDB = {

    // --------------Begin private methods------------
    // --------------End private methods--------------

    // -------------- Begin PSDB interface  methods --------------
    // A function that returns a list of objects for a given objtype.
    // No authentication needed
    // queryFields - the select clauses to get a subset of SeriesInfo objects
    // REVIEW: Removing this projection argument cause we want keep the SeriesInfo type specification. 
    // fieldsReturned - the projection that identifies 
    findSeries: function (queryFields: any, /* fieldsReturned: any, */callback: (err: Error, list: Array<SeriesInfo>) => void) {
        infoDBcrud.findObj(global.config.psdb.seriesInfoCollectionName, queryFields, {}, function (innerErr: Error, seriesList) {
            callback(innerErr, seriesList);
        });
    },

    // Function to get a token that represents access to the series object for a given series id, with previliges appropriate 
    // for the given "role". The credentials provided should have the given role previliges
    // Current Supported roles: 'administrator', 'instructor', 'player'
    // Possible errors: 
    //      "InvalidSeriesId"           "series id not found"
    //      "InvalidRoleType"           "Invalid role"
    //      "InvalidCredentials"        "Invalid credentials"
    //      "RoleNotSupportedForUser"   "User not authorized for role" 
    getSeriesToken: function (id: string, role: string, credentials: ICredentials, options: any, callback: (err: Error, token: string) => void) {
        //TODO: check if a puzzleSeries object exists for this combination of seriesId, role and credentials and hand out the same token (to avoid DOS attack)

        // Check if seriesId is valid
        infoDBcrud.findObj(global.config.psdb.seriesInfoCollectionName, { "_id": id }, { "name": 1, "dbName": 1 }, function (innerErr2: Error, seriesList: any[]) {
            if (innerErr2) {
                callback(innerErr2, null);
                return;
            }
            else if (seriesList.length == 0) {
                // No series with given id was found
                callback(utils.errors.invalidSeriesID, null);
                return;
            }
            else if (!seriesList[0].database) {
                // database not found - return error
                callback(utils.errors.inconsistentDB, null);
                return;
            }
            else {
                // check if credentials are valid and the given roletype is allowed for this username
                // Administrator user data is in the infoDB  whereas Instructor and player user data is within the specific db for the series
                // Check accordingly
                var userCrud, collectionName;
                switch (role) {
                    case "administrator":
                        userCrud = infoDBcrud;
                        collectionName = global.config.psdb.userInfoCollectionName;
                        break;
                    case "instructor":
                        userCrud = crudmodule.createDBHandle(global.config.psdb.serverName, seriesList[0].database);
                        collectionName = global.config.psdb.instructorsCollectionName;
                        break;
                    case "player":
                        userCrud = crudmodule.createDBHandle(global.config.psdb.serverName, seriesList[0].database);
                        collectionName = global.config.psdb.playersCollectionName;
                }
                userCrud.findObj(collectionName, { "name": credentials.userName }, { roleType: 1, password: 1 },
                    function (innerErr1: Error, userList: any[]) {

                        if (innerErr1) {
                            // Got an error from the CRUD call, pass it on..
                            callback(innerErr1, null);
                            return;
                        }
                        else if (userList.length === 0 ||
                            (userList[0].password && userList[0].password !== credentials.password)) {
                            // Username and/or password is not valid
                            callback(utils.errors.invalidCredentials, null);
                            return;
                        }
                        else {
                            //console.log(utils.getShortfileName(__filename) + " userList[0] = ");
                            //for (var pr in userList[0]) {
                            //    if (userList[0].hasOwnProperty(pr)) {
                            //        console.log(pr + " : " + userList[0][pr]);
                            //    }
                            //}
                            if (userList[0].roleType.indexOf(role) < 0) {
                                //given role is not allowed for this user
                                callback(utils.errors.invalidRole, null);
                                return;
                            }
                            else {
                                // Instantiate a token object and pass it on to puzzleSeries constructor, alongwith the name of the db
                                var seriesToken = new Token(id, seriesList[0].database, role, credentials);
                                // Save the IToken object in the tokenMap and set the crudHandle to null, we will create it
                                // when needed
                                tokenMap[seriesToken.tokenString] = { "token": seriesToken, "crudHandle": null };
                                utils.log(utils.getShortfileName(__filename) + " returning token " + seriesToken.tokenString);
                                callback(null, seriesToken.tokenString);
                            }
                        }
                    });
                return;
            }
        });
        return;
    },

    // Function to release a token that was previously obtained using getSeriesToken api
    // Possible errors: 
    //      "InvalidTokenId"    "Invalid token"
    releaseSeriesToken(token: string, callback: SimpleCallBack): void {
        // Make sure the given token is still valid
        if (tokenMap[token] && tokenMap[token].token && tokenMap[token].token.isValid()) {
            delete tokenMap[token];
            callback(null);
        }
        else {
            //Invalid token
            callback(utils.errors.invalidTokenID);
        }

    },

    // Synchronous call to get a puzzleSeries object represented by given token (which was handed out earlier)
    // return value will be null if the token is invalid or has expired
    series(token: string): IPuzzleSeries {
        // Check the token is still valid
        if (tokenMap[token]) {
            if (tokenMap[token].token && tokenMap[token].token.isValid()) {
                if (tokenMap[token].crudHandle == null) {
                    // Need to get a handle to the database first
                    tokenMap[token].crudHandle = crudmodule.createDBHandle(global.config.psdb.serverName, tokenMap[token].token.database);
                }
                return new PuzzleSeries(tokenMap[token].token, tokenMap[token].crudHandle);
            }
            else {
                utils.log(utils.getShortfileName(__filename) + " got an invalidToken request with token: " + token);
                delete tokenMap[token];
                return null;
            }
        }
        return null;
    }
    // -------------- End PSDB interface  methods --------------

}

export = psdb;
