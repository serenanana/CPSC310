"use strict";
var chai_1 = require("chai");
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe('InsightFacadeSpec', function () {
    var fs = require("fs");
    var IF = new InsightFacade_1.default();
    it('remove dataSet successful', function (done) {
        IF.removeDataset("courses")
            .then(function (data) {
            console.log(data.body);
            done();
        }).catch(function (err) {
            console.log(err.body);
            done();
        });
    });
    it('424', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect.fail();
        }).catch(function (err) {
            chai_1.expect(err.code).to.equal(424);
            console.log(err.body);
            done();
        });
    });
    it('add dataSet successful', function (done) {
        fs.readFile("./courses.zip", function (err, data) {
            if (err)
                throw err;
            IF.addDataset("courses", data.toString("base64")).then(function (data) {
                console.log(data.code);
                console.log(data.body);
                done();
            })
                .catch(function (err) {
                console.log(1111);
                console.log(err);
                chai_1.expect.fail();
            });
        });
    });
    it('Perfrom query', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "IS": {
                            "courses_dept": "cpsc"
                        }
                    },
                    {
                        "IS": {
                            "courses_id": "310"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_pass",
                    "courses_fail",
                    "courses_year",
                    "courses_id"
                ],
                "ORDER": "courses_year",
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
//# sourceMappingURL=InsightFacadeSpec.js.map