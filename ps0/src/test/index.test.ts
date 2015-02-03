//
//   MODULE: index.test.js 
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: index.test.js
//   DESCRIPTION: File contains the Puzzle Orchestration rest APIs
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 19th    NSA  Created
//
//
// This handles the test cases to test the rest API endpoints

var request = require('supertest'),
    express = require('express'),
    assert = require('assert'),
    app = require('../app.js'),
    //psdb = require('../lib/psdb/psdb'),
    agent = request.agent(app);


request = request(app);

describe('Server REST API', function () {
    // Test for retrievning invalid collection type
    describe('GET /:type', function () {
        it('this should return a error if invalid type is found', function (done) {
            request.get('/alert("error")')
                .expect(500)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
    });

    // Tests involving series (valid type)
    describe('GET /series', function () {
        // DO we need to make sure psdb is initialized?
        //before(function (done) {
        //    psdb.Init(function (err: Error) {
        //        if (err) {
        //            done(err);
        //        }
        //        else {
        //            done();
        //        }
        //    });
        //});
        // Get series list
        it('this should return an array of the type series if found valid', function (done) {
            request.get('/series')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });

        // Test for searching using query parameters
        it('this should return an array of the type for the corresponding query parameters', function (done) {
            request.get('/series?name=name=Test%20Series1')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        describe('Series GET AND DELETE token - Positive/Negative', function () {
            var testAccount = {
                "id": "psdbSeriesInfo1",
                "credentials": {
                    "username": "Admin1",
                    "password": "testAdminPassword",
                    "roleType": "administrator"
                },
                "invalidCredentials1": {
                    "username": " ",
                    "password": "dummyPassword",
                    "roleType": "administrator"
                },
                "invalidCredentials2": {
                    "username": "Admin1",
                    "password": "dummyPassword",
                    "roleType": "administrator"
                }
            },
            sessionToken;


            // Send a valid series id, username and get a token
            it('this should return a valid token for the series', function (done) {
                request.post('/series/' + testAccount.id + '/session')
                    .send(testAccount.credentials)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        sessionToken = res.body.token;
                        assert.ok(typeof(sessionToken) === 'string');
                        assert.ok(sessionToken && !(/^\s*$/.test(sessionToken)));
                        done();
                    }
                });
            });

            // Send a valid series id, invalid username and get a error
            it('this should return an error as the paramertes are invalid', function (done) {
                request.post('/series/' + testAccount.id + '/session')
                    .send(testAccount.invalidCredentials1)
                    .expect(500)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            // Send a valid series id, invalid password and get a error
            it('this should return an error as the paramertes are invalid', function (done) {
                request.post('/series/' + testAccount.id + '/session')
                    .send(testAccount.invalidCredentials2)
                    .expect(500)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            // Delete a valid series token
            it('this should delete the token', function (done) {
                request.delete('/series/' + testAccount.id + '/session/' + sessionToken)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });
        });
    });

    describe('REST endpoints within series', function () {
        var testAccount = {
            "credentials": {
                "username": "Admin1",
                "password": "testAdminPassword",
                "roleType": "administrator"
            },
            "id": "psdbSeriesInfo1",
            "sessionToken": "",
            "series": {
                "annotations": {
                },
                "events": {
                    "id": "events1",
                    "id2": "events2",
                    "queryParameters": "description%5D=test%2A%28%29",
                    "newEventObj": { 'name': 'events2', 'status': 'notStarted', "description": "event2 description", "_id": "events2" },
                    "newEventObjId": "",
                    "newUpdateEventObj": { 'name': "new name events2" },
                },
                "instructors": {
                },
                "players": {
                    playerId: "players8",
                },
                "puzzles": {
                },
                "puzzlestates": {
                    "puzzleIdInvalid": "puzzles5",
                    "puzzleIdValid": "puzzles1",
                    "teamIdValid": "teams1"
                },
                "teams": {
                    teamId: "teams1",
                    newTeamPlayersInactive: ["players5", "players7"],
                    newTeamPlayersInvalidId: ["players9"],
                    newTeamPlayersValid: ["players1", "players5", "players6"],
                    newTeamPlayersExisting: ["players5", "players3"],
                    newTeamPlayersDelete: ["players5", "players6"],
                    newTeamLeadIdInvalid: { "teamLeadId": "players5" }
                }
                
            }
        };
        
        before(function (done) {
            request.post('/series/' + testAccount.id + '/session')
                .send(testAccount.credentials)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        testAccount.sessionToken = res.body.token;
                        done();
                    }
                });
        });

        // Test for retrieving generic types list: events, players, teams, instructor

        describe("Test accessing collection without setting the token", function () {
            for (var coll in testAccount.series) {
                it('this should throw error since there are no valid token', function (done) {
                    request.get('/' + coll)
                        .expect(500)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                            } else {
                                done();
                            }
                        });
                });
            }
        });

        describe("Test generic endpoints", function () {
            for (var coll in testAccount.series) {
                it('this should return an array of the type for the corresponding query parameters', function (done) {
                    request.get('/' + coll)
                        .set('token', testAccount.sessionToken)
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                            } else {
                                done();
                            }
                        });
                });
            }
            

            // Test for searching using query parameters
            it('this should return an array of the type for the corresponding query parameters', function (done) {
                request.get('/events?' + testAccount.series.events.queryParameters)
                    .set('token', testAccount.sessionToken)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            // Test for a single object type
            it('this should return an object of the type with the corresponding id', function (done) {
                request.get('/events/' + testAccount.series.events.id)
                    .set('token', testAccount.sessionToken)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            //// Test for a single object type
            it('this should return the status of the type with the corresponding id', function (done) {
                request.get('/events/' + testAccount.series.events.id + '/status')
                    .set('token', testAccount.sessionToken)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        }
                        else if (res.body !== "notStarted" && res.body !== "started" && res.body !== "ended") {
                            done({ message: "Invalid status returned: " + JSON.stringify(res.body), name: "Invalid status value" });
                        }
                        else {
                            done();
                        }
                    });
            });

            //// Test for a single object type
            it('test the invalid status update of event type with the corresponding id', function (done) {
                request.put('/events/' + testAccount.series.events.id2 + '/status')
                    .set('token', testAccount.sessionToken)
                    .send({'status': 'ended' })
                    .expect(500)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            //// Test for a single object type
            it('test activating/deactivating an object with the corresponding id', function (done) {
                request.put('/players/' + testAccount.series.players.playerId + '/active')
                    .set('token', testAccount.sessionToken)
                    .send({ 'active': true })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            // In the spirit of keeping the test db unchanged - deactivate
                            request.put('/players/' + testAccount.series.players.playerId + '/active')
                                .set('token', testAccount.sessionToken)
                                .send({ 'active': false })
                                .expect(200)
                                .end(function (err, res) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        done();
                                    }
                                });
                        }
                    });
            });

            //// Test for adding an invalid teamLead to a team
            it('test  for adding an invalid teamLead to a team', function (done) {
                request.put('/teams/' + testAccount.series.teams.teamId)
                    .set('token', testAccount.sessionToken)
                    .send(testAccount.series.teams.newTeamLeadIdInvalid)
                    .expect(500)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else
                            done();
                    });
            });
            //// Test for adding a single object 
            it('test adding, updating and deleting an object', function (done) {
                request.post('/events')
                    .set('token', testAccount.sessionToken)
                    .send(testAccount.series.events.newEventObj)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        }
                        else {
                            if (res.body.name !== testAccount.series.events.newEventObj.name) {
                                done({ message: "addobj failed", name: "addobj failed" });
                            }
                            else {
                                testAccount.series.events.newEventObjId = res.body._id;
                                request.put('/events/' + testAccount.series.events.newEventObjId)
                                    .send(testAccount.series.events.newUpdateEventObj)
                                    .set('token', testAccount.sessionToken)
                                    .expect(200)
                                    .end(function (err2, res2) {
                                        if (err2) {
                                            done(err2);
                                        }
                                        else {
                                            // Find the object and confirm it was updated
                                            request.get('/events/' + testAccount.series.events.newEventObjId)
                                                .set('token', testAccount.sessionToken)
                                                .expect(200)
                                                .expect('Content-Type', /json/)
                                                .end(function (err4, res4) {
                                                    if (err4) {
                                                        done(err4);
                                                    }
                                                    else {
                                                        // Somehow, this doesnt work - dont know how to get the name field out of this
                                                        // single json object returned.
                                                        //if (res4[0].name !== testAccount.series.events.newUpdateEventObj.name) {
                                                        //    err4 = { message: "updateObj failed", name: "updateObj failed" };
                                                        //}
                                                        // we will delete the obj in any case
                                                        request.delete('/events/' + testAccount.series.events.newEventObjId)
                                                            .set('token', testAccount.sessionToken)
                                                            .expect(200)
                                                            .end(function (err3, res3) {
                                                                if (err3) {
                                                                    done(err3);
                                                                }
                                                                else if (err4 !== null) {
                                                                    done(err4);
                                                                }
                                                                else {
                                                                    done(); // success!!
                                                                }
                                                            });
                                                    }
                                                });
                                        }
                                    });
                            }
                        }
                    });
            });
        });
        describe('Test for updating subitem lists', function () {
            //// Test for updating subitem lists 
            it('test for updating subitem lists inactive item', function (done) {
                request.put('/teams/'+ testAccount.series.teams.teamId + "/players")
                    .set('token', testAccount.sessionToken)
                    .send(testAccount.series.teams.newTeamPlayersInactive)
                    .expect(500)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else {
                            done();
                        }
                    });
            });
            //// Test for updating subitem lists - invalid items
            it('test for updating subitem lists invalid item', function (done) {
                request.put('/teams/' + testAccount.series.teams.teamId + "/players")
                    .set('token', testAccount.sessionToken)
                    .send(testAccount.series.teams.newTeamPlayersInvalidId)
                    .expect(500)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else {
                            done();
                        }
                    });
            });
            //// Test for updating subitem lists - 
            it('test for updating subitem lists - existing items', function (done) {
                request.put('/teams/' + testAccount.series.teams.teamId + "/players")
                    .set('token', testAccount.sessionToken)
                    .send(testAccount.series.teams.newTeamPlayersExisting)
                    .expect(500)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else {
                            done();
                        }
                    });
            });

            //// Test for updating subitem lists - valid items
            it('test for updating subitem lists - valid items', function (done) {
                request.put('/teams/' + testAccount.series.teams.teamId + "/players")
                    .set('token', testAccount.sessionToken)
                    .send(testAccount.series.teams.newTeamPlayersValid)
                    .expect(200)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else {
                            // Make the delete request and restore the teams object
                            request.delete('/teams/' + testAccount.series.teams.teamId + "/players")
                                .set('token', testAccount.sessionToken)
                                .send(testAccount.series.teams.newTeamPlayersDelete)
                                .expect(200)
                                .expect('Content-Type', /json/)
                                .end(function (err, res) {
                                    if (err)
                                        done(err);
                                    else {
                                        done();
                                    }
                                });
                        }
                    });
            });

            // Tests for updating puzzleStates
            it('Tests for updating puzzleStates - invalid puzzleId', function (done) {
                request.put("/teams/" + testAccount.series.puzzlestates.teamIdValid + "/puzzleStates/" +
                    testAccount.series.puzzlestates.puzzleIdInvalid)
                    .set('token', testAccount.sessionToken)
                    .send("true")
                    .expect(500)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else {
                            done();
                        }
                    });

            });
            it('Tests for updating puzzleStates - valid puzzleId', function (done) {
                request.put("/teams/" + testAccount.series.puzzlestates.teamIdValid + "/puzzleStates/" +
                    testAccount.series.puzzlestates.puzzleIdValid)
                    .set('token', testAccount.sessionToken)
                    .send({ "puzzleStateSolved": "false" })
                    .expect(200)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else {
                            done();
                        }
                    });

            });
            // Reset the puzzlestate
            it('Tests for updating puzzleStates - reset valid puzzleId', function (done) {
                request.put("/teams/" + testAccount.series.puzzlestates.teamIdValid + "/puzzleStates/" +
                    testAccount.series.puzzlestates.puzzleIdValid)
                    .set('token', testAccount.sessionToken)
                    .send({ "puzzleStateSolved": "false" })
                    .expect(200)
                    .end(function (err, res) {
                        if (err)
                            done(err);
                        else {
                            done();
                        }
                    });

            });


        });
    });
});

