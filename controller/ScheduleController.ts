/**
 * Created by Serenanana on 2017-03-24.
 */

import {InsightResponse, QueryRequest, C, Room, GeoResponse, Building, TimeSlot} from "./IInsightFacade";

import Log from "../Util";

var message:InsightResponse = <InsightResponse>{};
var parse5 = require("parse5");
var http = require('http');


export default class ScheduleController {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    schedule (rooms:Room[], courses:C[]): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject) {
            //console.log("Number of Rooms: ", rooms.length);
            //console.log("Number of Courses: ", courses.length);

            courses = get_num_sections(courses);


            console.log(courses);

            var sortedRoom:any[] = rooms.sort(orderByKeys(["rooms_seats"]));
            var sortedCourses:any[] = courses.sort(orderByKeys(["number"]));

            //console.log(sortedRoom);
            //console.log(sortedCourses);

            for(var i=0; i<sortedRoom.length; i++){
                var room = sortedRoom[i]; // current room;
                //console.log(room.rooms_fullname);
                room.schedule = <TimeSlot>{MWF:[], TTH:[]};

                for(var c of sortedCourses){
                   // console.log(c.courses_id);
                    //console.log(c.scheduled, c.number);
                    if(c.scheduled) continue; // skip the scheduled courses...

                    if(room.rooms_seats < c.number) break;

                    //console.log("SCHEDULE: ",room.schedule);


                    if(room.schedule.MWF.length != 9){
                        c.scheduled = true;
                        c.room = room;
                        room.schedule.MWF.push(c);

                    }else if(room.schedule.TTH.length != 6){
                        c.scheduled  = true;
                        c.room = room;
                        room.schedule.TTH.push(c);

                    }else{
                        break;
                    }
                }

                //console.log(room.rooms_fullname," ",room.schedule);
            }
            message.code = 200;
            message.body = sortedRoom;
            fulfill(message);
            //console.log("Scheduling finished...");

        });
    }

}

// courses are the courses from the same department and/or with a certain course number.
/* name: {
            name: cpsc 310
            sec_num: 2
            seats: 200
                }
*/
function get_num_sections(courses:any){
    var results:any = {};

    for(let course of courses) {
        let name = course.courses_dept + " " + course.courses_id;

        if( name in results){
            var c = results[name];
            if( course.courses_year == "2014")
                c.sec_num = c.sec_num + 1;
            if( course.courses_fail + course.courses_pass > c.seats){
                c.seats = course.courses_fail + course.courses_pass;
            }
        } else {
            var c:any = {name: name, sec_num: course.courses_year == 2014 ? 1 : 0, seats: course.courses_fail + course.courses_pass};
            results[name] = c;
        }
    }

    let keys = Object.keys(results);
    for(let k of keys){
        console.log(results[k].sec_num);
        results[k].sec_num % 3 == 0 ? results[k].sec_num /= 3 :  results[k].sec_num = results[k].sec_num / 3 + 1;
    }

    var cs:any = [];
    for(let k of keys){
        let n = results[k].sec_num;
        console.log("N: "+n);
        for(var i=0; i<n ; i++){
            let new_course = {number:results[k].seats, name: k, scheduled: false, room: <Room>{}};
            cs.push(new_course);
        }
    }
    console.log(cs);
    return cs;
}

// function add_fields_to_courses(courses: any[]): any {
//     for(var c of courses){
//         let number = c.courses_fail + c.courses_pass;
//         let name = c.courses_dept.concat(c.courses_id);
//         c.number = number;
//         c.name = name;
//         c.scheduled = false;
//         c.room = <Room>{};
//     }
//     return courses;
// }

function orderByKeys(orderKeys:string[]) :any{
    return function (a:any,b:any) :any {
        for(var i = 0; i<orderKeys.length; i++){
            if(a[orderKeys[i]]!==b[orderKeys[i]]){
                // return a[orderKeys[i]] - b[orderKeys[i]];
                return a[orderKeys[i]] < b[orderKeys[i]] ? -1 : a[orderKeys[i]] > b[orderKeys[i]] ? 1 : 0;
            }
        }
        return 0;
    };
}
