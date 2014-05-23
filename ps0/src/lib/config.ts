//
//   MODULE: config
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: config.ts
//   DESCRIPTION: File containing the config management module
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 15th    TJ  Created
// 
/// <reference path="../inc/ext/node.d.ts"/>


var fs = require('fs');

// Function to read configuration object from  file "filename.json". 
// In addition, it looks for a file, if any, by name "filename.NODE_ENV.json" for any overriding
// configurations. The object from "filename.NODE_ENV.json" is merged into the config object
var readConfig = function (filename: string) {
    var config, env, filenameEnv, configEnv;
    //TODO: Check if file exists
    config = JSON.parse(fs.readFileSync(filename + '.json', 'utf8'));
    env = process.env.NODE_ENV;
    if (env != undefined) {
        console.log('running in env: ' + env);
        filenameEnv = filename + '.' + env + '.json';
        if (fs.existsSync(filenameEnv)) {
            console.log('file found' + filenameEnv);
            configEnv = JSON.parse(fs.readFileSync(filenameEnv, 'utf8'));
            config = merge(config, configEnv);
        }
        else {
            console.log('file not found' + filenameEnv);
        }
    }
    else {
        console.log('env not found ' + env);
    }
    return config;
}

// Function to merge properties of o2 into o1
var merge = function (o1: any, o2: any) {
    for (var prop in o2) {
        var val = o2[prop];
        if (o1.hasOwnProperty(prop)) {
            if (typeof val == 'object') {
                if (val && val.constructor != Array) { // not array
                    val = merge(o1[prop], val);
                }
            }
        }
        o1[prop] = val; // copy and override
    }
    return o1;
}
export = readConfig;