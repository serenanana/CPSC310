"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var Server_1 = require("../src/rest/Server");
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
describe('ServerSpec', function () {
    var fs = require("fs");
    var server;
    before("Start server", function (done) {
        server = new Server_1.default(4321);
        server.start()
            .then(function (status) {
            if (status) {
                console.log("Server Start");
                done();
            }
        })
            .catch(function (err) {
            console.log(err);
            console.log("Server down");
            done();
        });
    });
    after(function (done) {
        server.stop()
            .then(function (status) {
            if (status) {
                console.log("Server Closed");
                done();
            }
        })
            .catch(function (err) {
            console.log(err);
        });
    });
    it("PUT 204", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res) {
            console.log(res.body);
            chai_1.expect(res.status).to.equal(204);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("PUT 204", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function (res) {
            console.log(res.body);
            chai_1.expect(res.status).to.equal(204);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("PUT 201", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res) {
            console.log(res.body);
            chai_1.expect(res.status).to.equal(201);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("PUT 201", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function (res) {
            console.log(res.body);
            chai_1.expect(res.status).to.equal(201);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("PUT 400", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/invalid')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res) {
            chai_1.expect.fail();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err.body);
            chai_1.expect(err.status).to.equal(400);
        });
    });
    it("POST 200", function () {
        return chai.request("http://localhost:4321")
            .post('/query')
            .send({
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
        })
            .then(function (res) {
            Util_1.default.trace('then:');
            console.log(res.body);
            chai_1.expect(res.status).to.equal(200);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("POST 400", function () {
        return chai.request("http://localhost:4321")
            .post('/query')
            .send({
            "WHERE": {
                "GT": {}
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        })
            .then(function (res) {
            Util_1.default.trace('then:');
            console.log(res);
            chai_1.expect.fail();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err.body);
            chai_1.expect(err.status).to.equal(400);
        });
    });
    it("DEL 204", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/rooms')
            .then(function (res) {
            console.log(res);
            chai_1.expect(res.status).to.equal(204);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
    it("DEL 204", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/courses')
            .then(function (res) {
            console.log(res);
            chai_1.expect(res.status).to.equal(204);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=ServerSpec.js.map