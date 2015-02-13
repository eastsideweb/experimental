//
//   MODULE: DBCRUDMODULE
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: crud.ts
//   DESCRIPTION: File containing the interface supported by the module that provides low level CRUD database capabilities
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 5th    TJ  Created
// 
/// <reference path="../../inc/ext/node.d.ts"/>
/// <reference path="../../inc/psdb.d.ts"/>
/// <reference path="../../inc/crud.d.ts"/>

// Main module that PSDB module interfaces with to get the low level CRUD functionality - it will instantiate appropriate DBCRUD module 
// depending on the mode (debug vs non-debug)

import fakedbModule = require('../fakedb/fakedb');
import mongodbModule = require('./mongodbcrud');
//"use strict"

var dbcrudmodule: DBCRUDModule = {
    createDBHandleAsync: function (server: string, dbName: string, callback) {
        if (global.config.psdb.useFakeDB) {
            // useFakeDB is set, return the fakedb module
            fakedbModule.createDBHandleAsync(global.config.psdb.fakeserver, dbName, callback);
        }
        else {
            mongodbModule.createDBHandleAsync(server, dbName, callback);
        }
        return;
    },
    createDBHandle: function (server: string, dbName: string): DBCRUD {
        if (global.config.psdb.useFakeDB) {
            // useFakeDB is set, return the fakedb module
            return fakedbModule.createDBHandle(global.config.psdb.fakeserver, dbName);
        }
        else {
            return mongodbModule.createDBHandle(server, dbName);
        }
    }
}
export = dbcrudmodule;
