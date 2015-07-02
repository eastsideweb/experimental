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
"use strict";

import express = require('express');
var router = new express.Router();

import validator = require('../lib/validator');

import psdb = require('../lib/psdb/psdb');

/// Validations of requests
// Checks if it is a valid string type
router.param('type', function (request, response, next, type) {
    if (validator.isCharactersOnly(type)) {
        // Pass on the request to next associated handler
        next();
    }
    else {
        // Pass on the request to the error handler
        // By pass all other handlers
        next(new Error('The requested url does not contain a valid type:' + type));
    }
});



/// Routing API



// Handles the default request to the root url
router.get('/', function (request, response) {
    // Change this to redirect to index.html page that displays all the series
    response.send('respond with a resource');
});


/// Region series
/// Start of series related requests


// Handles the request for getting the list of series or query related to series
// Request: GET contains series  
// Response: set of series list
router.get('/series', function (request, response, next) {
    // Check for query parameters, else return all the available lists
    var query = (request.query !== null) ? psdb.translateURLQuery(request.query) : {};
    var series = psdb.findSeries(query.findMap, query.projectionMap, function (err, seriesList) {
        if (err) {
            next(err);
        }
        else {
            response.setHeader('Cache-Control', 'no-cache, no-store');
            response.json(seriesList);
        }
    });
});

// Handles the request for getting the session id associated with a particular series
// Called prior to viewing a series details
// Request: POST should contain a valid series id, username and password
// Response: valid token (session)
router.post('/series/:id/session', function (request, response, next) {
    //Retrieve user name and password
    var username = request.body.username;
    var password = request.body.password;
    var roleType = request.body.roleType;
    var creds: ICredentials = { 'userName': username, 'password': password };
    if (validator.isValidString(username) && validator.isValidString(password) && validator.isValidString(roleType)) {
        psdb.getSeriesToken(request.params.id, roleType, creds, {}, function (err, token) {
            if (err) {
                next(err);
            }
            else {
                response.json({ token: token });
            }
        });
    }
    else {
        next(new Error('Not valid credentials, please provide valid credentials'));
    }
});

// Handles the request for clearing the token associated with a particular series (logout)
// Request: DELETE should contain a valid token
// Response: status 200 ok
router.delete('/series/:id/session/:token', function (request, response, next) {
    //request.params.token;
    //Check for token and Invalidate the token
    psdb.releaseSeriesToken(request.params.token, function (err) {
        if (err) {
            next(err);
        }
        else {
            response.json(200, {});
        }
    });
});



/// End region series



/// Region types (require token for operations)



// Handles the validation of authentication for all the incoming requests
// Validates the incoming request if it contains a valid token in the header
router.all('/:type*', function (request, response, next) {
    // TODO: Validate token value
    var token = request.header('token');
    if (validator.isValidString(token)) {
        next();
    }
    else {
        next(new Error('This is an invalid token ( ' + token +' ) please provide a valid session token') );
    }
});

// Handles the request for getting list of types (events, players, teams etc)
// Also performs search on entities if query params are present
// Request: GET should contain a valid type, (and valid query string)
// Response: list of the requested type
router.get('/:type', function (request, response,next) {
    var token = request.header('token');
    var query = (request.query !== null) ? psdb.translateURLQuery(request.query) : {};
    var series = psdb.series(token);
    series.findObj(request.params.type, query.findMap, query.projectionMap, function (err: Error, list: any[]) {
        if (err) {
            next(err);
        }
        else {
            response.setHeader('Cache-Control', 'no-cache, no-store');
            response.json(list);
        }
    });
});

// Handles the request for getting a details of requested type
// Not applicable for associated sub collections as they are retrieved using query parameters
// Retrieves details of the particular type
// Reequest: GET should contain a valid id of the requested type
// Response: json object containing the details of the requested type
router.get('/:type/:id', function (request, response,next) {
    var token = request.header('token');
//    var query = (request.query !== null) ? request.query : {};
    var series = psdb.series(token);
    series.findObj(request.params.type, {"_id": request.params.id}, {}, function (err: Error, list: any[]) {
        if (err) {
            next(err);
        }
        else {
            response.setHeader('Cache-Control', 'no-cache, no-store');
            response.json(list[0]);
        }
    });
});

// Handles the request for get the status of the requested type
// Applicable only for events.
// Request: GET should contain only events
// Response: Status of the event: notstarted/ended/started
router.get('/:type/:id/status', function (request, response,next) {
    // This should only work with events type so check that out first
    if (request.params.type !== "events") {
        next(new Error('This is an invalid token ( ' + token + ' ) please provide a valid session token'));
    }
    else {
        var token = request.header('token');
        //var query = (request.query !== null) ? request.query : {};
        var series = psdb.series(token);
        series.findObj(request.params.type, { "_id": request.params.id }, { _id: 0, status: 1 }, function (err: Error, list: any[]) {
            if (err) {
                next(err);
            }
            else {
                response.setHeader('Cache-Control', 'no-cache, no-store');
                response.json(200, list[0].status);
            }
        });
    }
});


// Handles the request for creating a particular type
// Request: POST containing the respective json object passed in the body
// Response: the requested json object type created
router.post('/:type', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);
    var newObj = request.body;
    series.addObj(request.params.type, newObj, function (err: Error, objInfo: any) {
        if (err) {
            next(err);
        }
        else {
            response.setHeader('Cache-Control', 'no-cache, no-store');
            response.json(200, objInfo);
        }
    });
});

// Handles the reqest for modifying puzzle states associated to a team
// Request: PUT containing json puzzle state string
// Response: status ok
router.put('/teams/:teamId/puzzlestates/:puzzleId', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);
    var puzzlestate: string = request.body.puzzleStateSolved;
    series.updatePuzzleState(request.params.teamId, request.params.puzzleId, puzzlestate, function (err: Error) {
        if (err !== null) {
            next(err);
        }
        else {
            response.json(200, {});
        }
    });
});

// Handles the request for modifying a particular type
// Not allowed sub-collections when used as association
// Request: PUT containing the respective type to be modified, should contain a valid id
// Response: count for the updated type
router.put('/:type/:id', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);
    series.updateObj(request.params.type, request.params.id, request.body, function (err: Error, count: number) {
        if (err !== null) {
            next(err);
        }
        else {
            response.json(200, {});
        }
    });
});

// Handles the request to delete a particular type
// Request: DELETE containing a valid type id
// Response: status ok
router.delete('/:type/:id', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);

    series.deleteObj(request.params.type, { "_id": request.params.id }, function (err: Error, count: number) {
        if (err) {
            next(err);
        }
        else if (count !== 1) {
            next(new Error('Object deletion failed'));
        }
        else {
            response.json(200, {});
        }
    });
});

// Handles the request for activating a particular type  
// Request: PUT body containing true or false for states representing activate/deactivate
// Response: status ok
router.put('/:type/:id/active', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);
    series.setActive(request.params.type, request.params.id, request.body.active, function (err: Error) {
        if (err) {
            next(err);
        }
        else {
            response.json(200, {});
        }
    });
});

// Handles the request for setting status on a particular type 
// Applicable only for events
// Reuquest: PUT containing status: notstarted/ended/started
// Response: status ok
router.put('/events/:id/status', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);
    console.log(" events/id/status got " + JSON.stringify(request.body));
    series.setEventStatus(request.params.id, request.body.status, function (err: Error) {
        if (err !== null) {
            next(err);
        }
        else {
            response.json(200, {});
        }
    });
});



/// Region for sub collections

// Handles the request to get associated type (e.g. players or puzzles to the team)
// Request: GET containing valid type and a valid subtype associated with that type
// Response: list of ids of the subtype
router.get('/:type/:id/:associatedtype', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);
    series.findObj(request.params.type, { "_id": request.params.id }, {}, function (err: Error, list: any[]) {
        if (err) {
            next(err);
        }
        else {
            response.setHeader('Cache-Control', 'no-cache, no-store');
            response.json(200, list[0][request.params.associatedtype]);
        }
    });
});

// Handles the request to add associated type (players or puzzles to the team)
// Request: PUT containing the json of ids of associated type (json containing player id or array of player ids)
// Response: status ok
router.put('/:type/:id/:associatedtype', function (request, response,next) {
    var token = request.header('token');
    var series = psdb.series(token);
    var itemList = request.body;
    series.addItemsToObj(itemList, request.params.associatedtype, request.params.id, request.params.type, function (err: Error) {
        if (err !== null) {
            next(err);
        }
        else {
            response.json(200, {});
        }
    });
});


// Handles the request to remove associated type items from the given object (e.g players or puzzles to the team)
// Request: delete containing the json of ids of associated type (json containing player id or array of player ids)
// Response: status ok
router.delete('/:type/:id/:associatedtype', function (request, response, next) {
    var token = request.header('token');
    var series = psdb.series(token);
    var itemList = request.body;
    if (itemList === null || itemList.length === 0) {
        next(new Error('Empty delete id list encountered'));
    }
    else {
        series.removeItemsFromObj(itemList, request.params.associatedtype, request.params.id, request.params.type, function (err: Error, count: number) {
            if (err !== null) {
                next(err);
            }
            else {
                response.json(200, { "count": count });
            }
        });
    }
});

/// End region for subcollections

/// End region with token

module.exports = router;
