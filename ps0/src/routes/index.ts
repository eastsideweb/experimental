//
//   MODULE: index 
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: index.ts
//   DESCRIPTION: File contains the Puzzle Orchestration rest APIs
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 10th    NSA  Created
//
//
// This handles the requests to rest API endpoints
///<reference path="../inc/ext/express.d.ts"/>
///<reference path="../lib/typedefinition.ts"/>

"use strict";

import express = require('express');
var router = new express.Router();

import typeDef = require('../lib/typedefinition');
var types = new typeDef();

// TODO: Valdiations, exception handling and including the PSDB module
// TODO: change all the reponses to return correct response objects
//router.param('id', '/^[0-9a-fA-F]{24}$/');
router.all('/:type*', function (request, response, next) {
    if (types.checkValidType(request.params.type) !== undefined) {
        next();
    }
    else {
        response.json({
            error_msg: request.params.type + ' is not a valid object type'
        });
    }
});

// Handles the default request to the root url
router.get('/', function (req, res) {
    // Change this to redirect to index.html page that displays all the series
    res.send('respond with a resource');
});

// Gets all the entities or perform search on entities if query params are present
// TODO:// create a separate request handing based on regex match for query parameters
router.get('/:type', function (req, res) {
    // pasdb function

    //if it has query parameters, format and then pass it to 
    //check for any type other than series need token
    res.json({ 'type': req.params.type });
});

// Gets the session token for the respective series id
router.post('/:type(' + types.getTypesAssociatedWithToken() + ')/:id/session', function (req, res) {

    //retrieve user name and password from req body and generate token
    res.json({ 'type': req.params.type });
});

// Deletes the session token for the respective series id
router.delete('/:type(' + types.getTypesAssociatedWithToken() + ')/:id/session/:token', function (req, res) {
    // Invalidate the token
    res.json({});
});

router.get('/:type/:id', function (req, res) {
    res.json({});
});

// Creates the respective type object passed in the body
router.post('/:type', function (req, res) {
    res.json({});
});

// Modify an type
router.put('/:type/:id', function (req, res) {
    res.json({});
});

// Activates the type. Not applicable for events. 
// Body: true or false for states representing activate/deactivate
router.put('/:type(' + types.getTypesAssociatedWithActiveState() + ')/:id/active', function (req, res) {
    res.json({});
});

// Activates the type. Applicable only for events.
// Status: notstarted/ended/started
router.put('/:type(' + types.getTypesAssociatedWithStatus() + ')/:id/status', function (req, res) {
    res.json({});
});

// Gets the status of the type. Applicable only for events.
// Status: notstarted/ended/started
router.get('/:type(' + types.getTypesAssociatedWithStatus() + ')/:id/status', function (req, res) {
    res.json({});
});

// Deletes the type
router.delete('/:type/:id', function (req, res) {
    res.json({});
});

// Add players or puzzles to the team
router.post('/:type(' + types.getTypesWithAssociatedRelations() + ')/:id/:associatedtype(' + types.getTypesAssociatedWithTeams() + ')', function (req, res) {
    res.json({});
});

// Remove players or puzzles from the team
router.delete('/:type(' + types.getTypesWithAssociatedRelations() + ')/:id/:associatedtype(' + types.getTypesAssociatedWithTeams() + ')', function (req, res) {
    res.json({});
});

// Modify puzzle states to a team
router.put('/:type(' + types.getTypesWithAssociatedRelations() + ')/:id/puzzlestates/id', function (req, res) {
    res.json({});
});

module.exports = router;
