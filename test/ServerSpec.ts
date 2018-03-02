/**
 * Created by Ian on 2017-03-08.
 */

import {expect} from 'chai';

import Log from "../src/Util";
import Server from "../src/rest/Server";

var chai = require('chai')
    , chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('ServerSpec', function() {

    var fs = require("fs");
    let server:Server;

    before("Start server",function(done) {
        server = new Server(4321);
        server.start()
            .then(function (status){
                if (status){
                    console.log("Server Start");
                    done();
                }
            })
            .catch(function (err){
                console.log(err);
                console.log("Server down");
                done();
            })
    });

    after(function(done){
        server.stop()
            .then(function (status){
                if (status){
                    console.log("Server Closed");
                    done();
                }
            })
            .catch( function (err){
                console.log(err);
            })

    })

    it("PUT 204", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                console.log(res.body);
                expect(res.status).to.equal(204);
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err);
                // some assertions
                expect.fail();
            });
    });

    it("PUT 204", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function (res: any) {
                console.log(res.body);
                expect(res.status).to.equal(204);
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err);
                // some assertions
                expect.fail();
            });
    });

    it("PUT 201", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                console.log(res.body);
                expect(res.status).to.equal(201);
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err);
                // some assertions
                expect.fail();
            });
    });

    it("PUT 201", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("./courses.zip"), "courses.zip")
            .then(function (res: any) {
                console.log(res.body);
                expect(res.status).to.equal(201);
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err);
                // some assertions
                expect.fail();
            });
    });

    it("PUT 400", function () {
        return chai.request("http://localhost:4321")
            .put('/dataset/invalid')
            .attach("body", fs.readFileSync("./rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                expect.fail();
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err.body);
                expect(err.status).to.equal(400);
            });
    });

    it("POST 200", function () {
        return chai.request("http://localhost:4321")
            .post('/query')
            .send({
                "WHERE":{
                    "GT":{
                        "courses_avg":97
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            })
            .then(function (res: any) {
                Log.trace('then:');
                // some assertions
                console.log(res.body);
                expect(res.status).to.equal(200);
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err);
                // some assertions
                expect.fail();
            });
    });

    it("POST 400", function () {
        return chai.request("http://localhost:4321")
            .post('/query')
            .send({
                "WHERE":{
                    "GT":{
                    }
                },
                "OPTIONS":{
                    "COLUMNS":[
                        "courses_dept",
                        "courses_avg"
                    ],
                    "ORDER":"courses_avg",
                    "FORM":"TABLE"
                }
            })
            .then(function (res: any) {
                Log.trace('then:');
                console.log(res);
                expect.fail();
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err.body);
                expect(err.status).to.equal(400);

            });
    });

    it("DEL 204", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/rooms')
            .then(function (res: any) {
                console.log(res);
                expect(res.status).to.equal(204);
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err);
                // some assertions
                expect.fail();
            });
    });

    it("DEL 204", function () {
        return chai.request("http://localhost:4321")
            .del('/dataset/courses')
            .then(function (res: any) {
                console.log(res);
                expect(res.status).to.equal(204);
            })
            .catch(function (err:any) {
                Log.trace('catch:');
                console.log(err);
                // some assertions
                expect.fail();
            });
    });
});
