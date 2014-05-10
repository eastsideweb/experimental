//
//   MODULE: routes 
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: routes.ts
//   DESCRIPTION: File defines the routes used by the server
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 10th    NSA  Created
//
//
// This creates the routing module
///<reference path="./inc/ext/node.d.ts"/>
///<reference path="./inc/ext/express.d.ts"/>

"use strict";

var routes = require('./routes/index');
module.exports = function (app) {

    // Define the routes
    app.use('/', routes);
};