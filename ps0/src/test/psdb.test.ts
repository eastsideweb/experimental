//
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
/// <reference path="../inc/ext/node.d.ts"/>
/// <reference path="../inc/ext/should.d.ts"/>
/// <reference path="../inc/ext/mocha.d.ts"/>
/// <reference path="../inc/psdb.d.ts"/>
/// <reference path="../inc/crud.d.ts"/>
// tests for psdb module apis
import assert = require("assert");
import psdb = require('../lib/psdb/psdb');
import config = require("../lib/config");
import utils = require("../lib/utils");
import series = require("../lib/psdb/series");
import crudmodule = require('../lib/psdb/crudmodule');
var should = require("should");


// We will use the optional field called "handleToDataBase" of the DBCRUD which gives a snapshot of the database as an object
// we will first test the findobj api on the first series in the database and then use create, update and remove apis to build up 
// the second test series in the database 

global.config = config(__dirname + '/../config');

var psdb_findSeries = function (done) {
    psdb.findSeries({}, function (err: Error, list: SeriesInfo[]) {
        if (err)
            done(err);
        else {
            handleToInfoDatabase.should.be.ok;
            assert(list.length == handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName].length);
            done();
        }
    });
};

var handleToInfoDatabase, infoDBCrud;
infoDBCrud = crudmodule.createDBHandle(global.config.psdb.serverName, global.config.psdb.infoDBName);
handleToInfoDatabase = infoDBCrud.handleToDataBase ? infoDBCrud.handleToDataBase : null;

describe("psdb apis tests", function () {
    var savedToken, savedSeries, seriesId1, credentials;
    it("psdb findseries api", psdb_findSeries);
    it("psdb getseriesToken api - invalid seriesID", function (done) {        
        psdb.getSeriesToken("wrongSeriesId", "administrator", null, {}, function (err: Error, token: string) {
            err.should.ok;
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
            (err == null).should.be.true;
            token.should.be.a.String;
            savedToken = token;
            done();
        });
    });
    it("psdb releaseSeriesToken api", function (done) {
        psdb.releaseSeriesToken(savedToken, function (err: Error) {
            (err == null).should.be.true;
            done();
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
                    (psdb.series(token) == null).should.be.true;
                    // Reset the tolerence
                    global.config.psdb.tokenValidityTolerence = oldTolerence;
                    done();
                }, 1100);
            });
    });          

    it("psdb series api", function (done) {
        savedSeries = psdb.series(savedToken);
        (savedSeries == null).should.be.true;
        done();
    });
});
describe("series apis test with administrator role", function () {
    var seriesToken, seriesId1, credentials, seriesCRUD, handleToSeriesDatabase;
    it("getSeriesToken", function (done) {
        //*** WARNING: assuming order in the array in the seriesInfoCollectionName
        seriesId1 = handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0]._id;
        credentials = {
            "userName": handleToInfoDatabase[global.config.psdb.userInfoCollectionName][0].name,
            "password": handleToInfoDatabase[global.config.psdb.userInfoCollectionName][0].password
        };
        seriesCRUD = crudmodule.createDBHandle(global.config.psdb.serverName, handleToInfoDatabase[global.config.psdb.seriesInfoCollectionName][0].database);
        handleToSeriesDatabase = seriesCRUD.handleToDataBase;
        handleToSeriesDatabase.should.be.ok;
        psdb.getSeriesToken(seriesId1, "administrator",
            credentials, {}, function (err: Error, token: string) {
                if (err) {
                    done(err);
                }
                else {
                    token.should.be.a.String;
                    seriesToken = token;
                    done();
                }
            });
    });

    it("series findObj api - all valid objectTypes", function (done) {
        var series = psdb.series(seriesToken);
        series.should.be.ok;
        series.findObj('event', {}, {}, function (err: Error, eventList) {
            if (err) {
                done(err);
            }
            else {
                eventList.should.have.length(handleToSeriesDatabase[global.config.psdb.eventsCollectionName].length);
                if (eventList.length == 1) {
                    eventList[0]._id.should.eql(handleToSeriesDatabase[global.config.psdb.eventsCollectionName][0]._id);
                }
                series.findObj('player', {}, {}, function (innerErr1: Error, playerList) {
                    if (innerErr1) {
                        done(innerErr1);
                    }
                    else {
                        playerList.should.have.length(handleToSeriesDatabase[global.config.psdb.playersCollectionName].length);
                        // cannot assume order in returned object list unless length is 1
                        if (playerList.length == 1) {
                            playerList[0]._id.should.eql(handleToSeriesDatabase[global.config.psdb.playersCollectionName][0]._id);
                        }
                        series.findObj('puzzle', {}, {}, function (innerErr2: Error, puzzleList) {
                            if (innerErr2) {
                                done(innerErr2);
                            }
                            else {
                                puzzleList.should.have.length(handleToSeriesDatabase[global.config.psdb.puzzlesCollectionName].length);
                                // cannot assume order in returned object list unless length is 1
                                if (puzzleList.length == 1) {
                                    puzzleList[0]._id.should.eql(handleToSeriesDatabase[global.config.psdb.puzzlesCollectionName][0]._id);
                                }
                                series.findObj('team', {}, {}, function (innerErr3: Error, teamList) {
                                    if (innerErr3) {
                                        done(innerErr3);
                                    }
                                    else {
                                        teamList.should.have.length(handleToSeriesDatabase[global.config.psdb.teamsCollectionName].length);
                                        // cannot assume order in returned object list unless length is 1
                                        if (teamList.length == 1) {
                                            teamList[0]._id.should.eql(handleToSeriesDatabase[global.config.psdb.teamsCollectionName][0]._id);
                                        }
                                        series.findObj('instructor', {}, {}, function (innerErr4: Error, instructorList) {
                                            if (innerErr4) {
                                                done(innerErr4);
                                            }
                                            else {
                                                instructorList.should.have.length(handleToSeriesDatabase[global.config.psdb.instructorsCollectionName].length);
                                                if (instructorList.length == 1) {
                                                    instructorList[0]._id.should.eql(handleToSeriesDatabase[global.config.psdb.instructorsCollectionName][0]._id);
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
        series.should.be.ok;
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

});
var tests = { "psdb_findSeries": psdb_findSeries };

exports["psdb_findseries"] = psdb_findSeries;