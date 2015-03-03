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

    "invalidteamId": {
        name: "InvalidteamId",
        message: "Invalid team id specified"
    },
    "invalidpuzzleId": {
        name: "InvalidpuzzleId",
        message: "Invalid puzzle id specified"
    },
    "invalidItemId": {
        name: "InvalidItemId",
        message: "Invalid item id specified"
    },
    "invalidItemType": {
        name: "InvalidItemType",
        message: "Invalid item type specified"
    },
    "itemNotActive": {
        name: "ItemNotActive",
        message: "One or more items are not active"
    },
    "invalidObjId": {
        name: "InvalidObjId",
        message: "Invalid object id specified"
    },

    "UnauthorizedAccess": {
        name: "UnauthorizedAccess",
        message: "Access to this api not supported for the RoleType"
    },
    "serverTimeOut": {
        name: "serverTimeOut",
        message:"Connection to the server timed out"
    },
    "initNotCalled": {
        name: "initNotCalled",
        message: "module not initialized"
    },
    "initPending": {
        name: "initPending",
        message: "module initialization completion pending"
    },
    "playerInOtherTeam": {
        name: "playerInOtherTeam",
        message: "one or more players are already in other team"
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
