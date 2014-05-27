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

import express = require('express');
import path = require('path');
import connect = require('connect');

import config = require('./lib/config');
global.config = config('config');

var app = express();

// Use the parser to encode json and url encoded body params
app.use(connect.json());
app.use(connect.urlencoded());

var routes = require('./routes')(app);

// view engine setup
// Commented as this is present in the auto generated view
// Will uncomment when the view is and its flow is finalized
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.set('title', 'Puzzle Orchestration');

app.use(express.static(path.join(__dirname, 'public')));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    //err.status = 404;
    next(err);
});

/// error handlers
if (app.get('NODE_ENV') === 'test') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
            .json({
            'error': {
                'title': err.message,
                'details': err
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        'error': {
            'title': err.message,
            'details': {}
        }
    });
});

module.exports = app;