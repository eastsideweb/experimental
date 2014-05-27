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
    agent = request.agent(app);

declare function describe(text: string, callback: () => void): any;
declare function it(text: string, callback: (done) => void): any;
declare function before(callback: (done) => void): any;

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
            request.get('/series?name=series1')
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

        describe('Series GET AND DELETE token', function () {
            var testAccount = {
                "id" :"1",
                "username": "test1",
                "password": "password"
            },
            sessionToken;

            // Send a valid series id and get a token
            it('this should return an array of the type if found valid', function (done) {
                request.post('/series/' + testAccount.id + '/session')
                    .send({ username: testAccount.username, password: testAccount.password })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            sessionToken = res.body.token;
                            assert(sessionToken, /^\w+$/);
                            done();
                        }
                    });
            });

            // Delete a valid series token
            it('this should return an array of the type if found valid', function (done) {
                request.delete('/series/' + testAccount.id + '/session/' + sessionToken)
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
        });
    });

    describe('REST endpoints within series', function () {
        var testAccount = {
            "username": "test1",
            "password": "password",
            "series": {
                "id": "1",
                "sessionToken": "",
                "events": {
                    "id": "1",
                    "queryParameters": "id=1234&name=event1&details%5Bdescription%5D=test%252A%2528%2529"
                }
            }
        };
        
        before(function (done) {
            request.post('/series/' + testAccount.series.id + '/session')
                .send(testAccount)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        testAccount.series.sessionToken = res.body.token;
                        done();
                    }
                });
        });

        // Test for retrieving generic types list: events, players, teams, instructor

        describe("Tests events endpoints", function () {

            it('this should return an array of the type for the corresponding query parameters', function (done) {
                request.get('/events')
                    .set('token', testAccount.series.sessionToken)
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
                request.get('/events?' + testAccount.series.events.queryParameters)
                    .set('token', testAccount.series.sessionToken)
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
                    .set('token', testAccount.series.sessionToken)
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
                    .set('token', testAccount.series.sessionToken)
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
            it('test the status of event type with the corresponding id', function (done) {
                request.put('/events/' + testAccount.series.events.id + '/status')
                    .set('token', testAccount.series.sessionToken)
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
        });
    });
});

