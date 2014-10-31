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

import fakedb = require('../fakedb/fakedb');
import mongoDBCRUD = require('./mongodbcrud');
"use strict"

var dbcrudmodule: DBCRUDModule = {
    createDBHandle: function (server: string, dbName: string) {
        var retval;
        if (global.config.psdb.useFakeDB) {
            // useFakeDB is set, return the fakedb module
            retval = new fakedb(global.config.psdb.fakeserver, dbName);
        }
        else {
            retval = new mongoDBCRUD(server, dbName);
        }
        return retval;
    }
}
export = dbcrudmodule;
