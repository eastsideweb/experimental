﻿//
//   MODULE: PSDB test using mocha
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: psdb.test.ts
//   DESCRIPTION: File containing the main psdb module tests using the mocha framework
//
//   HISTORY:
//     Date            By  Comment
//     2014 May 30th    TJ  Created
//     2014 Jun 13th    TJ  More tests added
//     2014 Jun 20th    TJ  Tests added for psdb api and PuzzleSeries.findObj api 
//     2014 July 20th   TJ  Tests added for PuzzleSeries.addObj api
//     2014 July 28th   TJ  Tests added for PuzzleSeries.updateObj api
/// <reference path="../inc/ext/node.d.ts"/>
/// <reference path="../inc/ext/should.d.ts"/>
/// <reference path="../inc/ext/mocha.d.ts"/>
/// <reference path="../inc/psdb.d.ts"/>
/// <reference path="../inc/crud.d.ts"/>
// tests for psdb module apis
import fs = require('fs');
import assert = require("assert");
import config = require("../lib/config");
global.config = config(__dirname + '/../config');
import utils = require("../lib/utils");
import psdb = require('../lib/psdb/psdb');
import series = require("../lib/psdb/series");
import crudmodule = require('../lib/psdb/crudmodule');
var should = require("should");


// We will use the optional field called "handleToDataBase" of the DBCRUD which gives a snapshot of the database as an object
// we will first test the findobj api on the first series in the database and then use create, update and remove apis to build up 
// the second test series in the database 


var psdb_findSeries = function (done) {
    psdb.findSeries({}, {}, function (err: Error, list: any[]) {
        if (err) {
            done(err);
        }
        else {
            assert(handleToInfoDatabase !== null && handleToInfoDatabase !== undefined);
            assert(list.length === handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName].length);
            done();
        }
    });
};

var psdb_init = function (done) {
    psdb.Init(function (err) {
        done(err);
    });
};

var setupHandleToDatabase = function (dbName: string, collections: Array<string>, dbOriginal: any) : void {
    var testfileName: string, testdirName: string = "./test/initTestDB/" + dbName + "/";
    if (dbOriginal === null || dbOriginal === undefined) {
        utils.log("setupHandleToDatabase called with null dbOriginal for dbName: " + dbName);
        return;
    }
    utils.log("reading db: from " + testdirName);
    for (var i = 0; i < collections.length; i++) {
        testfileName = testdirName + collections[i] + ".json";
        utils.log("reading collection: " + collections[i] + " from " + testfileName);
        if (fs.existsSync(testfileName)) {
            dbOriginal[collections[i]] = JSON.parse(fs.readFileSync(testfileName, 'utf8'));
            utils.log(dbOriginal[collections[i]].length);
        }
        else {
            utils.log("file not found " + testfileName);
        }
    }
}
var handleToInfoDatabase = {};
setupHandleToDatabase("testpsdbInfo", [global.config.psdb.seriesInfoCollectionName, global.config.psdb.userInfoCollectionName], handleToInfoDatabase);

describe("psdb apis tests", function () {
    before(function (done) {
        psdb_init(done);
    });

    var savedToken, savedSeries, seriesId1, credentials;
    it("psdb findseries api", psdb_findSeries);

    it("psdb getseriesToken api - invalid seriesID", function (done) {        
        psdb.getSeriesToken("wrongSeriesId", "administrator", null, {}, function (err: Error, token: string) {
            err.should.eql(utils.errors.invalidSeriesID);
            done();
        });
    });
    it("psdb getseriesToken api", function (done) {
        //*** WARNING: assuming order in the array in the seriesInfoCollectionName
        seriesId1 = handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0]._id;
        credentials = {
            "userName": handleToInfoDatabase[global.config.psdb.userInfoCollectionName][0].name,
            "password": handleToInfoDatabase[global.config.psdb.userInfoCollectionName][0].password
        };
        psdb.getSeriesToken(seriesId1, "administrator", credentials, {}, function (err: Error, token: string) {
            if (err) {
                done(err);
            }
            else {
                (typeof token).should.eql('string');
                savedToken = token;
                done();
            }
        });
    });
    it("psdb releaseSeriesToken api", function (done) {
        psdb.releaseSeriesToken(savedToken, function (err: Error) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        });
    });

    it("psdb releaseSeriesToken api - invalidToken", function (done) {
        psdb.releaseSeriesToken("randomtoken", function (err: Error) {
            err.should.eql(utils.errors.invalidTokenID);
            done();
        });
    });
    it("psdb releaseSeriesToken api - expired Token", function (done) {
        var oldTolerence = global.config.tokenValidityTolerence;
        global.config.psdb.tokenValidityTolerence = 100;
        psdb.getSeriesToken(seriesId1, "administrator",
            credentials, {}, function (err: Error, token: string) {
                setTimeout(function () {
                    (psdb.series(token) === null).should.eql(true);
                    // Reset the tolerence
                    global.config.psdb.tokenValidityTolerence = oldTolerence;
                    done();
                }, 1100);
            });
    });          

    it("psdb series api", function (done) {
        savedSeries = psdb.series(savedToken);
        (savedSeries === null).should.eql(true);
        done();
    });
});
describe("series apis test with administrator role", function () {
    var seriesToken, seriesToken2, seriesId1, seriesId2, credentials, handleToSeriesDatabase;
    before(function (done) {
        psdb.Init(function (err) {
            if (err) {
                done(err);
            }
            else {
                //*** WARNING: assuming order in the array in the seriesInfoCollectionName
                seriesId1 = handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0]._id;
                seriesId2 = handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][1]._id;
                credentials = {
                    "userName": handleToInfoDatabase[global.config.psdb.userInfoCollectionName][0].name,
                    "password": handleToInfoDatabase[global.config.psdb.userInfoCollectionName][0].password
                };
                handleToSeriesDatabase = {};
                setupHandleToDatabase(handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0].database, [global.config.psdb.eventsCollectionName, global.config.psdb.puzzlesCollectionName, global.config.psdb.playersCollectionName,
                    global.config.psdb.teamsCollectionName, global.config.psdb.instructorsCollectionName], handleToSeriesDatabase);
                assert(handleToSeriesDatabase !== null && handleToSeriesDatabase !== undefined);
                psdb.getSeriesToken(seriesId1, "administrator",
                    credentials, {}, function (err: Error, token: string) {
                        if (err) {
                            done(err);
                        }
                        else {
                            (typeof token).should.eql('string');
                            seriesToken = token;
                            psdb.getSeriesToken(seriesId2, "administrator",
                                credentials, {}, function (err2: Error, token2: string) {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        (typeof token2).should.eql('string');
                                        seriesToken2 = token2;
                                        done();
                                    }
                                });
                        }
                    });
            }
        });
    });
    it("series findObj api - all valid objectTypes", function (done) {
        var series = psdb.series(seriesToken);
        assert(series !== null && series !== undefined);
        series.findObj('events', {}, {}, function (err: Error, eventList) {
            if (err) {
                done(err);
            }
            else {
                eventList.length.should.eql(handleToSeriesDatabase[global.config.psdb.eventsCollectionName].length);
            if (eventList.length === 1) {
                    eventList[0].name.should.eql(handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0].name);
                }
                series.findObj('players', {}, {}, function (innerErr1: Error, playerList) {
                    if (innerErr1) {
                        done(innerErr1);
                    }
                    else {
                        playerList.should.have.length(handleToSeriesDatabase[global.config.psdb.playersCollectionName].length);
                        // cannot assume order in returned object list unless length is 1
                        if (playerList.length === 1) {
                            playerList[0].name.should.eql(handleToSeriesDatabase[global.config.psdb.playersCollectionName][0].name);
                        }
                        series.findObj('puzzles', {}, {}, function (innerErr2: Error, puzzleList) {
                            if (innerErr2) {
                                done(innerErr2);
                            }
                            else {
                                puzzleList.should.have.length(handleToSeriesDatabase[global.config.psdb.puzzlesCollectionName].length);
                                // cannot assume order in returned object list unless length is 1
                                if (puzzleList.length === 1) {
                                    puzzleList[0].name.should.eql(handleToSeriesDatabase[global.config.psdb.puzzlesCollectionName][0].name);
                                }
                                series.findObj('teams', {}, {}, function (innerErr3: Error, teamList) {
                                    if (innerErr3) {
                                        done(innerErr3);
                                    }
                                    else {
                                        teamList.should.have.length(handleToSeriesDatabase[global.config.psdb.teamsCollectionName].length);
                                        // cannot assume order in returned object list unless length is 1
                                        if (teamList.length === 1) {
                                            teamList[0].name.should.eql(handleToSeriesDatabase[global.config.psdb.teamsCollectionName][0].name);
                                        }
                                        series.findObj('instructors', {}, {}, function (innerErr4: Error, instructorList) {
                                            if (innerErr4) {
                                                done(innerErr4);
                                            }
                                            else {
                                                instructorList.should.have.length(handleToSeriesDatabase[global.config.psdb.instructorsCollectionName].length);
                                                if (instructorList.length === 1) {
                                                    instructorList[0].name.should.eql(handleToSeriesDatabase[global.config.psdb.instructorsCollectionName][0].name);
                                                }
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    it("series findObj api - invalid objectType", function (done) {
        var series = psdb.series(seriesToken);
        assert(series !== null && series !== undefined);
        series.findObj('dummyObject', {}, {}, function (err: Error, eventList) {
            if (err) {
                err.should.eql(utils.errors.invalidObjType);
                done();
            }
            else {
                done({ name: "InvalidObjFailed", message: "InvalidObj test with dummyObject objectTypeFailed" });
            }
        });
    });
    it("series addObj apis - valid and invalid objectTypes", function (done) {
        var series2, eventObj, teamObj, playerObj, puzzleStateCollectionName, instructorObj, puzzleStateObj;
        puzzleStateCollectionName = global.config.psdb.puzzleStatesCollectionNamePrefix + handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0]._id;
        setupHandleToDatabase(handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0].database, [puzzleStateCollectionName], handleToSeriesDatabase);
        series2 = psdb.series(seriesToken2);
        assert(series2 !== null && series2 !== undefined);
        eventObj = {
            "name": handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0].name,
            "description": handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0].description,
            "_id": "dummyId"
        };
        teamObj = {
            "name": handleToSeriesDatabase[global.config.psdb.teamsCollectionName][0].name,
            "description": handleToSeriesDatabase[global.config.psdb.teamsCollectionName][0].description,
            "teamLeadId": handleToSeriesDatabase[global.config.psdb.teamsCollectionName][0].teamLeadId,
            "_id": "dummyId"
        };
        puzzleStateObj = {
            "puzzleId": handleToSeriesDatabase[puzzleStateCollectionName][0].puzzleId,
            "teamId": handleToSeriesDatabase[puzzleStateCollectionName][0].teamId,
            "solved": false,
            "_id": "dummyId"
        };
        series2.addObj("events", eventObj, function (err: Error, objInfo: any /*ISeriesObject*/) {
            if (err) {
                done(err);
            }
            else {
                utils.log("***********addObj returned - " + JSON.stringify(objInfo));
                objInfo.name.should.eql(eventObj.name);
                eventObj.description.should.eql(objInfo.description);
                eventObj._id.should.not.eql(objInfo._id);
                assert(objInfo._id !== null && objInfo._id !== undefined);
                objInfo.active.should.eql(false);
                Array.isArray(objInfo.playerIds).should.eql(true);
                objInfo.playerIds.length.should.eql(0);
                Array.isArray(objInfo.puzzleIds).should.eql(true);
                objInfo.puzzleIds.length.should.eql(0);
                Array.isArray(objInfo.instructorIds).should.eql(true);
                objInfo.instructorIds.length.should.eql(0);
                Array.isArray(objInfo.teamIds).should.eql(true);
                objInfo.teamIds.length.should.eql(0);
                series2.addObj("teams", teamObj, function (innererr1: Error, objInfo1: any) {
                    if (innererr1) {
                        done(innererr1);
                    }
                    else {
                        objInfo1.name.should.eql(teamObj.name);
                        teamObj.description.should.eql(objInfo1.description);
                        teamObj._id.should.not.eql(objInfo1._id);
                        assert(objInfo1._id !== null && objInfo1._id !== undefined);
                        objInfo1.active.should.eql(false);
                        Array.isArray(objInfo1.playerIds).should.eql(true);
                        objInfo1.playerIds.length.should.eql(0);
                        Array.isArray(objInfo1.puzzleIds).should.eql(true);
                        objInfo1.puzzleIds.length.should.eql(0);
                        objInfo1.teamLeadId.should.eql(teamObj.teamLeadId);
                        // Skipping addObj of puzzle/instructor/player - no custom fields

                        // addObj of puzzleStates shouldn't succeed - we don't allow it directly. One is expected to use the 
                        // updatePuzzleState api
                        series2.addObj("puzzleStates", puzzleStateObj, function (innererr2: Error, objInfo2: any) {
                            innererr2.should.eql(utils.errors.invalidObjType, "puzzleStates cannot be added through addObj api");
                            series2.addObj("dummyObj", null, function (innererr3: Error, objInfo3: any) {
                                innererr3.should.eql(utils.errors.invalidObjType);
                                done();
                            });
                        });
                    }
                });
            }
        });
    });
    it("series updateObj apis - valid updates", function (done) {
        var series, eventUpdateObj, newEventDescription = "new Event Description",
            newteamLeadId = "dummyLeadId", eventId, teamId, teamUpdateObj, puzzleStateCollectionName, puzzleStateObj, oldEventDescription, oldeventObj;
        puzzleStateCollectionName = global.config.psdb.puzzleStatesCollectionNamePrefix + handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0]._id;
        setupHandleToDatabase(handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0].database, [puzzleStateCollectionName], handleToSeriesDatabase);
        series = psdb.series(seriesToken);
        assert(series !== null && series !== undefined);
        eventId = handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0]._id;
        teamId = handleToSeriesDatabase[global.config.psdb.teamsCollectionName][0]._id;
        eventUpdateObj = {
            "description": newEventDescription,
        };
        teamUpdateObj = {
            "teamLeadId": newteamLeadId,
        };
        puzzleStateObj = {
            "puzzleId": handleToSeriesDatabase[puzzleStateCollectionName][0].puzzleId,
            "teamId": handleToSeriesDatabase[puzzleStateCollectionName][0].teamId,
            "solved": false,
            "_id": "dummyId"
        };

        oldEventDescription = handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0].description;
        oldeventObj = {
            "description": oldEventDescription,
        };
        series.updateObj("events", eventId, eventUpdateObj, function (err: Error, count: number) {
            if (err) {
                done(err);
            }
            else {
                count.should.eql(1);
                series.findObj('events', { "_id": eventId }, {}, function (err1: Error, eventList) {
                    if (err1) {
                        done(err1);
                    }
                    else {

                        eventList.length.should.eql(1);
                        eventList[0].description.should.eql(newEventDescription);
                        eventList[0].name.should.eql(handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0].name);

                        // Reset the eventObj to its original state
                        series.updateObj('events', eventId, oldeventObj, function (err2: Error, count2: number) {
                            if (err2) {
                                done(err2);
                            }
                            else {
                                count2.should.eql(1);
                                done();
                            }
                        });
                    }
                });
            }
        });
    });

    it("series updateObj apis - invalid updates", function (done) {
        var series, eventUpdateObj,
            newteamLeadId = "dummyLeadId", eventId, teamId, teamUpdateObj, puzzleStateCollectionName, puzzleStateObj;
        puzzleStateCollectionName = global.config.psdb.puzzleStatesCollectionNamePrefix + handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0]._id;
        setupHandleToDatabase(handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0].database, [puzzleStateCollectionName], handleToSeriesDatabase);
        series = psdb.series(seriesToken);
        assert(series !== null && series !== undefined);
        eventId = handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0]._id;
        teamId = handleToSeriesDatabase[global.config.psdb.teamsCollectionName][0]._id;
        eventUpdateObj = {
            "status": "started"
        };
        teamUpdateObj = {
            "teamLeadId": newteamLeadId,
        };
        puzzleStateObj = {
            "puzzleId": handleToSeriesDatabase[puzzleStateCollectionName][0].puzzleId,
            "teamId": handleToSeriesDatabase[puzzleStateCollectionName][0].teamId,
            "solved": false,
            "_id": "dummyId"
        };
        series.updateObj("dummyObj", eventId, eventUpdateObj, function (err: Error, count: Number) {
            err.should.eql(utils.errors.invalidObjType);
            series.updateObj("events", eventId, eventUpdateObj, function (err1: Error, count: number) {
                err1.name.should.eql("InvalidUpdate");
                done();
            });
        });
    });
});
var tests = { "psdb_findSeries": psdb_findSeries };

exports.psdb_findseries = psdb_findSeries;