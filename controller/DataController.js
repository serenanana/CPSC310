"use strict";
var Util_1 = require("../Util");
var util_1 = require("util");
var hashData = {};
var hashCourseData = {};
var fs = require("fs");
var JSZip = require("jszip");
var message = {};
var parse5 = require("parse5");
var http = require('http');
var dataController = (function () {
    function dataController() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    dataController.prototype.addDataset = function (id, content) {
        return new Promise(function (fulfill, reject) {
            var insightMessage = {};
            var exist = 0;
            if (fs.existsSync(id + ".txt")) {
                console.log("existed");
                exist = 1;
            }
            if (id === "rooms") {
                var latlonPromises = [];
                var buildingArr = [];
                var roomArr_1 = [];
                console.log("Base64 content being read");
                JSZip.loadAsync(content, { base64: true }).then(function (unZipped) {
                    console.log("read the unzipped data");
                    var files = unZipped.files;
                    unZipped.file("index.htm").async("string").then(function (data) {
                        var html = parse5.parse(data);
                        var tbodyArr = findNode(html, "tbody");
                        var tbody = tbodyArr[0];
                        var trArr = findNode(tbody, "tr");
                        for (var _i = 0, trArr_1 = trArr; _i < trArr_1.length; _i++) {
                            var tr = trArr_1[_i];
                            var building = {};
                            var tdArr = findNode(tr, "td");
                            for (var _a = 0, tdArr_1 = tdArr; _a < tdArr_1.length; _a++) {
                                var td = tdArr_1[_a];
                                if (td.attrs[0].value === "views-field views-field-title") {
                                    var aArr = findNode(td, "a");
                                    var a = aArr[0];
                                    building.fullname = a.childNodes[0].value;
                                }
                                if (td.attrs[0].value === "views-field views-field-field-building-code") {
                                    building.shortname = td.childNodes[0].value.trim();
                                }
                                if (td.attrs[0].value === "views-field views-field-nothing") {
                                    var aArr = findNode(td, "a");
                                    var a = aArr[0];
                                    building.url = a.attrs[0].value.substr(2);
                                    building.file = unZipped.file(building.url);
                                }
                                if (td.attrs[0].value === "views-field views-field-field-building-address") {
                                    building.address = td.childNodes[0].value.trim();
                                    var uriAddress = encodeURIComponent(building.address.trim());
                                    building.geourl = "http://skaha.cs.ubc.ca:11316/api/v1/team130/" + uriAddress;
                                    latlonPromises.push(latlonhelper(building.geourl));
                                }
                            }
                            buildingArr.push(building);
                        }
                        Promise.all(latlonPromises)
                            .then(function (location) {
                            for (var i = 0; i < location.length; i++) {
                                if (util_1.isUndefined(location[i].error)) {
                                    buildingArr[i].lat = location[i].lat;
                                    buildingArr[i].lon = location[i].lon;
                                }
                            }
                            var _loop_1 = function (building_1) {
                                building_1.file.async("string").then(function (data) {
                                    var roominfo = parse5.parse(data);
                                    var tbodyArr = findNode(roominfo, "tbody");
                                    var tbody = tbodyArr[0];
                                    var trArr = findNode(tbody, "tr");
                                    building_1.dis = distanceHelper(building_1, buildingArr);
                                    for (var _i = 0, trArr_2 = trArr; _i < trArr_2.length; _i++) {
                                        var tr = trArr_2[_i];
                                        var room = {};
                                        room.rooms_fullname = building_1.fullname;
                                        room.rooms_shortname = building_1.shortname;
                                        room.rooms_address = building_1.address;
                                        room.rooms_lat = parseFloat(building_1.lat);
                                        room.rooms_lon = parseFloat(building_1.lon);
                                        room.rooms_dis = building_1.dis;
                                        var tdArr = findNode(tr, "td");
                                        for (var _a = 0, tdArr_2 = tdArr; _a < tdArr_2.length; _a++) {
                                            var td = tdArr_2[_a];
                                            if (td.attrs[0].value === "views-field views-field-field-room-number") {
                                                var aArr = findNode(td, "a");
                                                var a = aArr[0];
                                                room.rooms_number = a.childNodes[0].value;
                                                room.rooms_name = room.rooms_shortname + "_" + room.rooms_number;
                                            }
                                            if (td.attrs[0].value === "views-field views-field-field-room-capacity") {
                                                room.rooms_seats = parseInt(td.childNodes[0].value.trim());
                                            }
                                            if (td.attrs[0].value === "views-field views-field-field-room-type") {
                                                room.rooms_type = td.childNodes[0].value.trim();
                                            }
                                            if (td.attrs[0].value === "views-field views-field-field-room-furniture") {
                                                room.rooms_furniture = td.childNodes[0].value.trim();
                                            }
                                            if (td.attrs[0].value === "views-field views-field-nothing") {
                                                var aArr = findNode(td, "a");
                                                var a = aArr[0];
                                                room.rooms_href = a.attrs[0].value;
                                            }
                                        }
                                        roomArr_1.push(room);
                                    }
                                    var str = JSON.stringify(roomArr_1);
                                    hashData[id] = roomArr_1;
                                    fs.writeFile(id + ".txt", str);
                                    if (exist === 1) {
                                        insightMessage.code = 201;
                                        insightMessage.body = roomArr_1;
                                        fulfill(insightMessage);
                                    }
                                    else {
                                        insightMessage.code = 204;
                                        insightMessage.body = roomArr_1;
                                        fulfill(insightMessage);
                                    }
                                })
                                    .catch(function (stuff) {
                                    stuff = { code: 400, body: { "error": "Error in building parsing" } };
                                    reject(stuff);
                                });
                            };
                            for (var _i = 0, buildingArr_1 = buildingArr; _i < buildingArr_1.length; _i++) {
                                var building_1 = buildingArr_1[_i];
                                _loop_1(building_1);
                            }
                        })
                            .catch(function (stuff) {
                            stuff = { code: 400, body: { "error": "Error in latlon promises" } };
                            reject(stuff);
                        });
                    })
                        .catch(function (stuff) {
                        stuff = { code: 400, body: { "error": "Error in reading index.htm" } };
                        reject(stuff);
                    });
                })
                    .catch(function (stuff) {
                    stuff = { code: 400, body: { "error": "Error in unzipping the files" } };
                    reject(stuff);
                });
            }
            else if (id === "courses") {
                var arrayPromise = [];
                var objArr = [];
                console.log("Base64 content being read");
                JSZip.loadAsync(content, { base64: true }).then(function (unZipped) {
                    console.log("read the unzipped data");
                    var files = unZipped.files;
                    console.log('is array: ' + Array.isArray(files));
                    console.log('Unzippled files are ' + typeof (files));
                    for (var filename in files) {
                        var file = unZipped.file(filename);
                        if (file) {
                            arrayPromise.push(file.async("string"));
                        }
                    }
                    Promise.all(arrayPromise)
                        .then(function (jArray) {
                        for (var i = 0; i < jArray.length; i++) {
                            var o = JSON.parse(jArray[i]);
                            if (o.result != []) {
                                for (var _i = 0, _a = o.result; _i < _a.length; _i++) {
                                    var v = _a[_i];
                                    if (v != []) {
                                        var obj = {};
                                        obj.courses_dept = v.Subject;
                                        obj.courses_id = v.Course;
                                        obj.courses_avg = v.Avg;
                                        obj.courses_instructor = v.Professor;
                                        obj.courses_title = v.Title;
                                        obj.courses_pass = v.Pass;
                                        obj.courses_fail = v.Fail;
                                        obj.courses_audit = v.Audit;
                                        obj.courses_uuid = v.id;
                                        obj.courses_size = v.Pass + v.Fail;
                                        if (v.Section == "overall") {
                                            obj.courses_year = 1900;
                                        }
                                        else {
                                            obj.courses_year = v.Year;
                                        }
                                        objArr.push(obj);
                                    }
                                }
                            }
                        }
                        var str = JSON.stringify(objArr);
                        hashCourseData[id] = objArr;
                        fs.writeFile(id + ".txt", str);
                        if (exist === 1) {
                            insightMessage.code = 201;
                            insightMessage.body = { 201: "the operation was successful and the id was existed" };
                            fulfill(insightMessage);
                        }
                        else {
                            insightMessage.code = 204;
                            insightMessage.body = { 204: "the operation was successful and the id was new" };
                            fulfill(insightMessage);
                        }
                    })
                        .catch(function (err) {
                        err = { code: 400, body: { "error": "Array of asyn Promises failed" } };
                        reject(err);
                    });
                })
                    .catch(function (stuff) {
                    stuff = { code: 400, body: { "error": "Error in unzipping the files" } };
                    reject(stuff);
                });
            }
            else {
                insightMessage = { code: 400, body: { "error": "Unacceptable IDs" } };
                reject(insightMessage);
            }
        });
    };
    dataController.prototype.removeDataset = function (id) {
        return new Promise(function (fulfill, reject) {
            if (fs.existsSync(id + ".txt")) {
                fs.truncate(id + ".txt", 0);
                fs.unlinkSync(id + ".txt");
                hashData[id] = {};
                delete hashData[id];
                message.code = 204;
                message.body = { id: "the operation was successful" };
                fulfill(message);
            }
            else {
                message.code = 404;
                message.body = { "error": "the operation was unsuccessful because the delete was for a resource that was not previously added" };
                reject(message);
            }
        });
    };
    dataController.prototype.getDataSet = function () {
        return hashData;
    };
    dataController.prototype.getCourseDataset = function () {
        return hashCourseData;
    };
    return dataController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dataController;
function findNode(html, name) {
    var returnNodes = [];
    if (html.nodeName === name) {
        returnNodes.push(html);
        return returnNodes;
    }
    if (html.childNodes != undefined) {
        var childArray = html.childNodes;
        for (var _i = 0, childArray_1 = childArray; _i < childArray_1.length; _i++) {
            var child = childArray_1[_i];
            var t = findNode(child, name);
            if (t.length != 0) {
                returnNodes = returnNodes.concat(t);
            }
        }
        return returnNodes;
    }
    return [];
}
function latlonhelper(geourl) {
    return new Promise(function (fulfill, reject) {
        http.get(geourl, function (res) {
            var rawData = '';
            res.on('data', function (chunk) { return rawData += chunk; });
            res.on('end', function () {
                try {
                    var parsedData = JSON.parse(rawData);
                    fulfill(parsedData);
                }
                catch (e) {
                    console.log(e.message);
                }
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    });
}
function distanceHelper(buildSelf, buildingArr) {
    var buildSelfDis = [];
    for (var _i = 0, buildingArr_2 = buildingArr; _i < buildingArr_2.length; _i++) {
        var building = buildingArr_2[_i];
        var lat1 = buildSelf.lat;
        var lat2 = building.lat;
        var lon1 = buildSelf.lon;
        var lon2 = building.lon;
        var d = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
        var buildingName = building.fullname;
        var buildingDis = new Object();
        buildingDis = { buildingName: buildingName, distance: d };
        buildSelfDis.push(buildingDis);
    }
    return buildSelfDis;
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
//# sourceMappingURL=DataController.js.map