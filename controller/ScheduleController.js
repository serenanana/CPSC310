"use strict";
var Util_1 = require("../Util");
var message = {};
var parse5 = require("parse5");
var http = require('http');
var ScheduleController = (function () {
    function ScheduleController() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    ScheduleController.prototype.schedule = function (rooms, courses) {
        return new Promise(function (fulfill, reject) {
            courses = get_num_sections(courses);
            console.log(courses);
            var sortedRoom = rooms.sort(orderByKeys(["rooms_seats"]));
            var sortedCourses = courses.sort(orderByKeys(["number"]));
            for (var i = 0; i < sortedRoom.length; i++) {
                var room = sortedRoom[i];
                room.schedule = { MWF: [], TTH: [] };
                for (var _i = 0, sortedCourses_1 = sortedCourses; _i < sortedCourses_1.length; _i++) {
                    var c = sortedCourses_1[_i];
                    if (c.scheduled)
                        continue;
                    if (room.rooms_seats < c.number)
                        break;
                    if (room.schedule.MWF.length != 9) {
                        c.scheduled = true;
                        c.room = room;
                        room.schedule.MWF.push(c);
                    }
                    else if (room.schedule.TTH.length != 6) {
                        c.scheduled = true;
                        c.room = room;
                        room.schedule.TTH.push(c);
                    }
                    else {
                        break;
                    }
                }
            }
            message.code = 200;
            message.body = sortedRoom;
            fulfill(message);
        });
    };
    return ScheduleController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScheduleController;
function get_num_sections(courses) {
    var results = {};
    for (var _i = 0, courses_1 = courses; _i < courses_1.length; _i++) {
        var course = courses_1[_i];
        var name_1 = course.courses_dept + " " + course.courses_id;
        if (name_1 in results) {
            var c = results[name_1];
            if (course.courses_year == "2014")
                c.sec_num = c.sec_num + 1;
            if (course.courses_fail + course.courses_pass > c.seats) {
                c.seats = course.courses_fail + course.courses_pass;
            }
        }
        else {
            var c = { name: name_1, sec_num: course.courses_year == 2014 ? 1 : 0, seats: course.courses_fail + course.courses_pass };
            results[name_1] = c;
        }
    }
    var keys = Object.keys(results);
    for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
        var k = keys_1[_a];
        console.log(results[k].sec_num);
        results[k].sec_num % 3 == 0 ? results[k].sec_num /= 3 : results[k].sec_num = results[k].sec_num / 3 + 1;
    }
    var cs = [];
    for (var _b = 0, keys_2 = keys; _b < keys_2.length; _b++) {
        var k = keys_2[_b];
        var n = results[k].sec_num;
        console.log("N: " + n);
        for (var i = 0; i < n; i++) {
            var new_course = { number: results[k].seats, name: k, scheduled: false, room: {} };
            cs.push(new_course);
        }
    }
    console.log(cs);
    return cs;
}
function orderByKeys(orderKeys) {
    return function (a, b) {
        for (var i = 0; i < orderKeys.length; i++) {
            if (a[orderKeys[i]] !== b[orderKeys[i]]) {
                return a[orderKeys[i]] < b[orderKeys[i]] ? -1 : a[orderKeys[i]] > b[orderKeys[i]] ? 1 : 0;
            }
        }
        return 0;
    };
}
//# sourceMappingURL=ScheduleController.js.map