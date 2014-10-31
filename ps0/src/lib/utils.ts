//
//   MODULE: utils
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: utils.ts
//   DESCRIPTION: File containing a set of utility functions used by other modules
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 29th    TJ  Created
// 
/// <reference path="../inc/ext/node.d.ts"/>
// Utility node module that implements a set of utility functions 


var errors = {
    "notImpl": {
        name: 'NOTIMPLEMENTED',
        message: 'Method not implemented yet'
    },
    "notInDebug": {
        name: 'NOTINDEBUG',
        message: 'Debug method called while not in debug mode'
    },
    "invalidCredentials": {
        name: "InvalidCredentials",
        message: 'Invalid credentials'
    },
    "invalidSeriesID": {
        name: "InvalidSeriesID",
        message: 'series id not found"'
    },
    "invalidRole": {
        name: "InvalidRoleType",
        message: "Invalid role"
    },
    "inconsistentDB": {
        name: "InconsistentDB",
        message: "Database has an inconsistent entry"
    },
    "invalidTokenID": {
        name: "InvalidRoleTokenID",
        message: "Invalid token"
    },
    "invalidObjType": {
        name: "InvalidObjType",
        message: "Invalid object type specified"
    },
    "UnauthorizedAccess": {
        name: "UnauthorizedAccess",
        message: "Access to this api not supported for the RoleType"
    },
    "serverNotReady": {
        name: "serverNotReady",
        message:"Connection to the server not established"
    }
};
var getShortfileName = function (filename: string): string {
    var i = filename.lastIndexOf('\\');
    return filename.slice(i + 1);
};

var log = function (logstring: string) {
    if (global.config.printLog) {
        console.log("--------- " + logstring + " ---------");
    }
}

var utils = {
    "errors": errors,
    "getShortfileName": getShortfileName,
    "log": log
}
export = utils;
