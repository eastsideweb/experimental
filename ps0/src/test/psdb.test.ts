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
// 
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
var should = require("should");


global.config = config(__dirname + '/../config');

var psdb_findSeries = function (done) {
    psdb.findSeries({}, function (err: Error, list: SeriesInfo[]) {
        if (err)
            done(err);
        else {
            assert(list.length == 2);
            done();
        }
    });
};
describe("psdb apis tests", function () {
    var savedToken, savedSeries;
    it("psdb findseries api", psdb_findSeries);
    it("psdb getseriesToken api - invalid seriesID", function (done) {        
        psdb.getSeriesToken("wrongSeriesId", "administrator", null, {}, function (err: Error, token: string) {
            err.should.ok;
            err.should.eql(utils.errors.invalidSeriesID);
            //if (err && err.name == utils.errors.invalidSeriesID.name) {
            //    done();
            //}
            //else {
            //    done({ name: "InvalidSeriesNotfound", message: "invalidSeriesId error expected" });
            //}
            done();
        });
    });
    it("psdb getseriesToken api", function (done) {
        psdb.getSeriesToken("testSeriesId1", "administrator", { "userName": "Admin1", "password": "testAdminPassword" }, {}, function (err: Error, token: string) {
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
    it.skip("psdb releaseSeriesToken api - expired Token", function (done) {
        var oldTolerence = global.config.tokenValidityTolerence;
        global.config.psdb.tokenValidityTolerence = 100;
        psdb.getSeriesToken("testSeriesId1", "administrator",
            { "userName": "Admin1", "password": "testAdminPassword" }, {}, function (err: Error, token: string) {
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
    var seriesToken;
    it("getSeriesToken", function (done) {
        psdb.getSeriesToken("testSeriesId1", "administrator",
            { "userName": "Admin1", "password": "testAdminPassword" }, {}, function (err: Error, token: string) {
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
    it("series findObj api - events", function (done) {
        var series = psdb.series(seriesToken);
        series.should.be.ok;
        series.findObj('event', {}, {}, function (err: Error, eventList) {
            eventList.should.have.length(1);
            eventList[0]._id.should.eql("eventId1");
            done();
        });
    });
});
var tests = { "psdb_findSeries": psdb_findSeries };

exports["psdb_findseries"] = psdb_findSeries;