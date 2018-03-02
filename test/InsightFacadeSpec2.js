"use strict";
var chai_1 = require("chai");
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe('InsightFacadeSpec2', function () {
    var fs = require("fs");
    var IF = new InsightFacade_1.default();
    it('remove dataSet successful', function (done) {
        IF.removeDataset("rooms")
            .then(function (data) {
            console.log(data.body);
            done();
        }).catch(function (err) {
            console.log(err.body);
            done();
        });
    });
    it('add Course dataSet successful', function (done) {
        fs.readFile("./courses.zip", function (err, data) {
            if (err)
                throw err;
            IF.addDataset("courses", data.toString("base64")).then(function (data) {
                console.log(data.code);
                console.log(data.body);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        });
    });
    it('add Room dataSet successful', function (done) {
        fs.readFile("./rooms.zip", function (err, data) {
            if (err)
                throw err;
            IF.addDataset("rooms", data.toString("base64")).then(function (data) {
                console.log(data.code);
                console.log(data.body);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        });
    });
    it('add Room dataSet wrong id', function (done) {
        fs.readFile("./rooms.zip", function (err, data) {
            if (err)
                throw err;
            IF.addDataset("123", data.toString("base64")).then(function (data) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.code).to.equal(400);
                console.log(err.body);
                done();
            });
        });
    });
    it('Simplest Query', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "AERL_120"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_shortname"
                ],
                "ORDER": "rooms_shortname",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it('Query A', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
});
//# sourceMappingURL=InsightFacadeSpec2.js.map