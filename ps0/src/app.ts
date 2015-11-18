//
//   MODULE: app 
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: app.ts
//   DESCRIPTION: File containing the entry point code used by the server
//   to create and application instance
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 10th    NSA  Created
//
//
// This creates a new application instance
///<reference path="./inc/ext/node.d.ts"/>
///<reference path="./inc/ext/express.d.ts"/>
///<reference path="./inc/ext/connect.d.ts"/>

"use strict";

//process.env.NODE_ENV = 'test';

/// Instantiate all the necessary modules

import express = require('express');
import path = require('path');
// Use connect for middleware parsing of encoded params
import connect = require('connect');

import config = require('./lib/config');
global.config = config('config');
import psdb = require('./lib/psdb/psdb');
var app = express();

// Use the connect parser to parse body params
// Include parse options for both json encoded and url encoded body
app.use(connect.json());
app.use(connect.urlencoded());

// view engine setup
// Commented as this is present in the auto generated view
// Will uncomment when the view is and its flow is finalized
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');



/// Set the routing for all requests using express
/// Express handles routing based on the order in which handlers are added
/// Use next() function to pass on the request to the next handler
/// Use response.send() or response.json() to close the request processing and send the response

// Set atttribute on app.locals.settings
// Sets the title to be used in the view
app.set('title', 'Puzzle Orchestration');

// Set routing handler to serve all static files
// Set the directory public to serve static files
app.use(express.static(path.join(__dirname, 'public')));

var startServer = function (err: Error) {
    if (err !== null) {
        console.log('psdb module initialization failed with' + err.message);
    }
    else if (!global.config.test) {
        // We are not in test mode, start listening on the port
        app.set('port', process.env.PORT || 1566);
        var server = app.listen(app.get('port'), function () {
            console.log('Express server listening on port ' + server.address().port);
        });
    }
}
// Set routing handlers for all Rest API requests
var routes = require('./routes')(app);


// Set error handlers
// Assign a function as a handler, where error is passed as the first object
// Check for test environment and if yes, then pass on the details of the error
if (app.get('NODE_ENV') === 'test') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
            .json({
                'title': err.message,
                'details': err
        });
    });
}

// Production error handler
// No stacktraces leaked to user
app.use(function (err, req, res, next) {
    var time = new Date().toJSON().slice(0, 16);
    console.log("///////APP reporting error: ("+ time + " )" + err.message + " for url: " + req.url);
    res.status(err.status || 500).json({
            'title': err.message,
            'details': {}
    });
});

// Initialize the psdb module and start listening once it is done initializing
psdb.Init(startServer);

module.exports = app;