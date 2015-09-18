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
    initError: Error,
    initCalled,
    initCallbackArray: Array<any> = [],
    seriesInfoMap,
    roleTypes = {
        'administrator': 'administrator',
        'instructor': 'instructor',
        'player': 'player'
    },    
    tokenMap = {}, // Map of token string to the corresponding IToken object and the crudHandle to the series database
    env = process.env.BUILD_ENV || "ENV_NOT_FOUND";

//----------- Begin Initialization

console.log("Started psdb module in " + env + " ... ");
initError = null;
initCalled = false;
infoDBcrud = null;
seriesInfoMap = {};


//----------- End Initialization

var psdb: IPSDB = {

    // --------------Begin private methods------------
    checkAllOk: function (seriesId?: number) {
        if (!initCalled) {
            // Return initNotCalled error
            return utils.errors.initNotCalled;
        }
        else if (initError !== null) {
            return initError;
        }
        else if (infoDBcrud === null) {
            // We are waiting for the initialization to complete
            return utils.errors.initPending;
        }
        else if (seriesInfoMap === null) {
            // we don't have the seriesInfoMap cached - surprizing!
            //console.log("Returning inconsistentDB from checkAllOk 1");
            return utils.errors.inconsistentDB;
        }
        else if (seriesId && !seriesInfoMap[seriesId]) {
            return utils.errors.invalidSeriesID;
        }
        else if (seriesId && !seriesInfoMap[seriesId].dbHandle) {
            // dbHandle to the series database expected to be set already.
            //console.log("Returning inconsistentDB from checkAllOk 2");
            return utils.errors.inconsistentDB;
        }
        else {
            // All ok!
            return null;
        }
    },

    fixSeriesFieldsToReturn: function(inList: any): any {
        var found = false, outList = { 'name': 1, 'description': 1, "_id": 1 }, fieldsToRemove = [];
        if (Object.getOwnPropertyNames(inList).length === 0) {
            // incoming list was empty, return the allowed list
            return outList;
        }
        for (var prop in outList) {
            if (inList[prop] === undefined) {
                fieldsToRemove.push(prop);
            }
        }
        fieldsToRemove.forEach(function (prop) {
            delete outList[prop];
        });
        if (Object.getOwnPropertyNames(outList).length === 0) {
            // after pruning outlist was empty, reset to only the allowed list
            return { 'name': 1, 'description': 1, "_id": 1 };
        }
        else {
            return outList;
        }
    },
    getSeriesTokenInternal: function (seriesId: string, role: string, credentials: ICredentials, options: any, callback: (err: Error, token: string) => void) {
        var checkErr = this.checkAllOk(seriesId);
        if (checkErr !== null) {
            console.log("returning error out of getSeriesTOkenInternal: " + JSON.stringify(checkErr));
            setTimeout(function () {
                callback(checkErr, null);
            }, 100);
            return;
        }
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
                userCrud = seriesInfoMap[seriesId].dbHandle;
                collectionName = global.config.psdb.instructorsCollectionName;
                break;
            case "player":
                userCrud = seriesInfoMap[seriesId].dbHandle;
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

                    // if the roleType is instructor or player, we don't save the roleType field in the collection, so it will be undefined, 
                    // don't bother checking this then.
                    if (userList[0].roleType !== undefined && userList[0].roleType.indexOf(role) < 0) {
                        //given role is not allowed for this user
                        callback(utils.errors.invalidRole, null);
                        return;
                    }
                    else {
                        // Instantiate a token object and pass it on to puzzleSeries constructor, alongwith the name of the db
                        var seriesToken = new Token(seriesId, seriesInfoMap[seriesId].database, role, credentials);
                        // Save the IToken object in the tokenMap and set the crudHandle to null, we will create it
                        // when needed
                        tokenMap[seriesToken.tokenString] = { "token": seriesToken, "crudHandle": seriesInfoMap[seriesId].dbHandle };
                        utils.log(utils.getShortfileName(__filename) + " returning token " + seriesToken.tokenString);
                        callback(null, seriesToken.tokenString);
                    }
                }
            });
        return;
    },
    callInitCompleteCallback: function (err: Error) {
        var item = initCallbackArray.shift();
        while (item) {
            item(err);
            item = initCallbackArray.shift();
        }
    },
    // --------------End private methods--------------

    // -------------- Begin PSDB interface  methods --------------

    Init(initComplete: (err: Error) => void) {
        var self = this;
    console.log("******* psdb module init called with initCalled =  " + initCalled + " ***********" );
        if (initCalled === true) {
            // Init is called one more time. Check if all is ok - 
            var checkErr = this.checkAllOk();
            if (checkErr && checkErr === utils.errors.initPending) {
                //Add the callback function to callback array and return
                initCallbackArray.push(initComplete);
                return;
            }
            else if (checkErr) {
                initComplete(checkErr);
                return;
            }
            else {
                initComplete(null);
                return;
            }
        }
        else {
            initCalled = true;
            utils.log("psdb:Init() called with " + global.config.psdb.serverName + " " + global.config.psdb.infoDBName);
            initCallbackArray.push(initComplete);
            crudmodule.createDBHandleAsync(global.config.psdb.serverName, global.config.psdb.infoDBName, function (err: Error, dbcrud: DBCRUD) {
                utils.log("psdb:createDBHandleAsync returned with " + err);

                if (err === null) {
                    //Initialization was successful
                    infoDBcrud = dbcrud;
                    initError = null;
                    // Now cache the psdbseriesInfo database entries 
                    infoDBcrud.findObj(global.config.psdb.seriesInfoCollectionName, {}, {}, function (innerErr2: Error, seriesList: Array<any>) {
                        if (innerErr2 !== null) {
                            // error getting to the seriesInfo.
                            utils.log("findObj failed for seriesList with : " + innerErr2.message);
                            self.callInitCompleteCallback(innerErr2);
                        }
                        else {
                            // We have the seriesInfo, let's cache it
                            var seriesCount = seriesList.length;
                            for (var i = 0; i < seriesCount; i++) {
                                utils.log("got serisInfo for: " + seriesList[i]._id + " **** " + seriesList[i]);
                                seriesInfoMap[seriesList[i]._id] = seriesList[i];
                            }
                            utils.log("Cached serisInfo: " + JSON.stringify(seriesInfoMap));
                            self.callInitCompleteCallback(null);
                        }
                    });
                }
                else {
                    // Error during initialization
                    infoDBcrud = null;
                    initError = err;
                    self.callInitCompleteCallback(err);
                }
            });
        }
    },
    // A function that returns a list of objects for a given objtype.
    // No authentication needed
    // queryFields - the select clauses to get a subset of SeriesInfo objects
    // fieldsReturned - the projection that identifies 
    findSeries: function (queryFields: any,  fieldsReturned: any, callback: (err: Error, list: Array<any>) => void) {

        var fixedFieldsReturned, checkErr = this.checkAllOk();
        if (checkErr !== null) {
            setTimeout(function () {
                callback(checkErr, null);
            }, 100);
            return;
        }

        // Make sure the fieldsReturned has only allowed fields specified.
        fixedFieldsReturned = this.fixSeriesFieldsToReturn(fieldsReturned);

        infoDBcrud.findObj(global.config.psdb.seriesInfoCollectionName, queryFields, fixedFieldsReturned, function (innerErr: Error, seriesList) {
            //            utils.log("findObj returning: " + JSON.stringify(seriesList));
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
    getSeriesToken: function (seriesId: string, role: string, credentials: ICredentials, options: any, callback: (err: Error, token: string) => void) {
        var self = this;
        var checkErr = this.checkAllOk();
        if (checkErr !== null) {
            setTimeout(function () {
                callback(checkErr, null);
            }, 100);
            return;
        }

        //TODO: check if a puzzleSeries object exists for this combination of seriesId, role and credentials and hand out the same token (to avoid DOS attack)

        // Check if seriesId is valid
        if (!seriesInfoMap[seriesId]) {
            // No series with given id was found
            utils.log("invalid seriesId requested: " + seriesId);
            callback(utils.errors.invalidSeriesID, null);
            return;
        }
        if (!seriesInfoMap[seriesId].database) {
            // database not found - return error
            callback(utils.errors.inconsistentDB, null);
            return;
        }

        if (seriesInfoMap[seriesId].dbHandle) {
            // We are ready to check credentials and create and hand out the requested token
            //console.log("Found dbHandle for " + seriesId + "to be: " + seriesInfoMap[seriesId].dbHandle);
            self.getSeriesTokenInternal(seriesId, role, credentials, options, callback);
            return;
        }
        else {
            //We need to get the dbHandle and save it in the seriesInfoMap and then call the callback.
            crudmodule.createDBHandleAsync(global.config.psdb.serverName, seriesInfoMap[seriesId].database, function (innerErr3: Error, dbcrud: DBCRUD) {
                if (innerErr3 !== null) {
                    callback(innerErr3, null);
                }
                else {
                    seriesInfoMap[seriesId].dbHandle = dbcrud;
                    //console.log("Setting dbHandle to: " + dbcrud);
                    self.getSeriesTokenInternal(seriesId, role, credentials, options, callback);
                }
            });
            return;
        }
    },


    // Function to release a token that was previously obtained using getSeriesToken api
    // Possible errors: 
    //      "InvalidTokenId"    "Invalid token"
    releaseSeriesToken(token: string, callback: SimpleCallBack): void {
        // Make sure the given token is still valid
        if (tokenMap[token] && tokenMap[token].token && tokenMap[token].token.isValid()) {
            delete tokenMap[token];
            utils.log("Token released: " + token);
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
                if (tokenMap[token].crudHandle === null) {
                    utils.log(" Error: dbHandle to the series database is null in the request for a series object");
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
    },

    // Helper functions
    // Processes a query that was parsed by express app to a form that the underlying database understands
    // It extracts the query params (findMap) and the projection map (projectionMap) and returns the combined object
    //**** MONGODB dependency in the query construction ****MONGODB dependency //
    translateURLQuery(query: any): any {
        if (query === null || query === undefined) {
            return {};
        }
        var translatedQuery = { findMap: {}, projectionMap: {} },
            queryParts: string[],
            subparts: string[],
            fieldValue: any,
            values: any,
            queryOperator: string,
            projParts: string[];
    var transFunc = function (item) {
        translatedQuery.projectionMap[item] = 1;
    };
        for (var fieldName in query) {
            if (query.hasOwnProperty(fieldName)) {
                if (fieldName === global.config.psdb.projectionMapKeyWord) {
                    // Projection fields provided, adjust the projection map accordingly
                    projParts = query[fieldName].split(global.config.psdb.queryValueSeparator);
                    projParts.forEach(transFunc); //Pulled the definition of the function, out of the for loop to make jshint happy!
                }
                else {
                    // A query fieldName found, add it to the translatedQuery
                    if (query[fieldName].indexOf(global.config.psdb.queryValueSeparator) !== -1) {
                        // Mutliple parts specified for the values, extract the list
                        queryOperator = '$in';
                        values = query[fieldName].split(global.config.psdb.queryValueSeparator);
                    }
                    else {
                        queryOperator = null;
                        // Single value, see if it is a string corresponding to boolean value, if so set it to boolean value
                        if (query[fieldName] === "true" || query[fieldName] === "false") {
                            values = JSON.parse(query[fieldName]);
                        }
                        else {
                            // Pass it on as is
                            values = query[fieldName];
                        }
                    }
                    if (fieldName.lastIndexOf('!') === 0) {
                        // The part starts with a negation sign, we should use the $nin query operator
                        fieldName = fieldName.substr(1);
                        if (queryOperator === null) {
                            // set the values to be an array
                            values = [values];
                        }
                        // else the values must be an array already
                        queryOperator = '$nin';
                    }
                    if (queryOperator !== null) {
                        // Non-null query operator set, make it a complex query
                        fieldValue = {};
                        fieldValue[queryOperator] = values;
                    }
                    else {
                        fieldValue = values;
                    }
                    translatedQuery.findMap[fieldName] = fieldValue;
                }
            } // hasownProperty
        } // for fieldName
        return translatedQuery;
    }
    // -------------- End PSDB interface  methods --------------

}

export = psdb;
