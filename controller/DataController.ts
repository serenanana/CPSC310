import {InsightResponse, QueryRequest, C, Room, GeoResponse, Building} from "./IInsightFacade";

import Log from "../Util";
import {isUndefined} from "util";
import {isNumber} from "util";

var hashData:any = {};
var hashCourseData:any = {};
var fs = require ("fs");
var JSZip = require ("jszip");
var message:InsightResponse = <InsightResponse>{};
var parse5 = require("parse5");
var http = require('http');


export default class dataController {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset (id: string, content: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){

            var insightMessage:InsightResponse = <InsightResponse>{};
            var exist = 0;
            if(fs.existsSync(id+".txt")){
                console.log("existed");
                exist = 1;
            }

            //check whether data exist
            if (id === "rooms"){
                // var exist = 0;
                // if(fs.existsSync(id+".txt")){
                //     console.log("existed");
                //     exist = 1;
                // }
                var latlonPromises:any[] = [];
                var buildingArr:any[] = [];
                let roomArr:any[] = [];

                //check whether data exist

                console.log("Base64 content being read");

                JSZip.loadAsync(content, {base64: true}).then(function (unZipped: any) {
                    console.log("read the unzipped data");

                    //console.log(unZipped);

                    let files = unZipped.files;
                    //console.log(files);
                    unZipped.file("index.htm").async("string").then(function(data:any){

                        // console.log(data);

                        let html:any = parse5.parse(data);

                        // console.log(html);
                        let tbodyArr = findNode(html,"tbody");
                        // console.log(tbodyArr);

                        let tbody = tbodyArr[0];
                        // console.log(tbody);

                        let trArr = findNode(tbody,"tr");
                        // console.log(trArr);

                        for(let tr of trArr){
                            //each tr is a building; read info for one building
                            var building:Building = <Building>{};

                            let tdArr = findNode(tr,"td");
                            //read info of one building
                            for(let td of tdArr){
                                //fullname
                                if(td.attrs[0].value === "views-field views-field-title"){
                                    let aArr = findNode(td,"a");
                                    let a = aArr[0];
                                    building.fullname = a.childNodes[0].value;
                                }
                                //shortname
                                if(td.attrs[0].value === "views-field views-field-field-building-code"){
                                    building.shortname = td.childNodes[0].value.trim();
                                }
                                //filepath
                                if(td.attrs[0].value === "views-field views-field-nothing"){
                                    let aArr = findNode(td,"a");
                                    let a = aArr[0];
                                    building.url = a.attrs[0].value.substr(2);
                                    building.file = unZipped.file(building.url);
                                    //console.log(building.url);
                                    //filePromises.push (unZipped.file(building.url).async("string"));

                                }
                                //address&latlon
                                if(td.attrs[0].value === "views-field views-field-field-building-address"){
                                    building.address = td.childNodes[0].value.trim();
                                    //console.log(address);
                                    //get geolocation by address
                                    var uriAddress:string = encodeURIComponent(building.address.trim());
                                    building.geourl = "http://skaha.cs.ubc.ca:11316/api/v1/team130/"+uriAddress;
                                    latlonPromises.push(latlonhelper(building.geourl));
                                }

                            }
                            buildingArr.push(building);
                        }


                        Promise.all(latlonPromises)
                            .then(function (location:GeoResponse[]){

                                for (var i =0; i <location.length;i++){
                                    //console.log(location[i]);
                                    if( isUndefined(location[i].error)){
                                        //console.log(location[i].lat);
                                        buildingArr[i].lat = location[i].lat;
                                        buildingArr[i].lon = location[i].lon;
                                        //console.log(buildingArr[i]);
                                        //console.log(buildingArr[i].dis);
                                    }
                                }


                                for(let building of buildingArr){
                                    building.file.async("string").then(function (data:any) {
                                        let roominfo:any = parse5.parse(data);
                                        let tbodyArr = findNode(roominfo,"tbody");
                                        let tbody = tbodyArr[0];
                                        let trArr = findNode(tbody,"tr");

                                        building.dis = distanceHelper(building,buildingArr);//??

                                        for(let tr of trArr){
                                            //each tr is a room; read info for one room
                                            var room:Room = <Room>{};
                                            room.rooms_fullname = building.fullname;
                                            room.rooms_shortname = building.shortname;
                                            room.rooms_address = building.address;

                                            room.rooms_lat = parseFloat(building.lat);
                                            room.rooms_lon = parseFloat(building.lon);
                                            room.rooms_dis = building.dis; //??
                                            //console.log(building.dis);
                                            let tdArr = findNode(tr,"td");
                                            //read info of one room
                                            for(let td of tdArr){
                                                if(td.attrs[0].value === "views-field views-field-field-room-number"){
                                                    let aArr = findNode(td,"a");
                                                    let a = aArr[0];
                                                    room.rooms_number = a.childNodes[0].value;
                                                    room.rooms_name = room.rooms_shortname+"_"+room.rooms_number;
                                                }
                                                if(td.attrs[0].value === "views-field views-field-field-room-capacity"){
                                                    room.rooms_seats = parseInt(td.childNodes[0].value.trim());
                                                }
                                                if(td.attrs[0].value === "views-field views-field-field-room-type"){
                                                    room.rooms_type = td.childNodes[0].value.trim();
                                                }
                                                if(td.attrs[0].value === "views-field views-field-field-room-furniture"){
                                                    room.rooms_furniture = td.childNodes[0].value.trim();
                                                }
                                                if(td.attrs[0].value === "views-field views-field-nothing"){
                                                    let aArr = findNode(td,"a");
                                                    let a = aArr[0];
                                                    room.rooms_href = a.attrs[0].value;
                                                }
                                            }
                                            roomArr.push(room);
                                        }


                                        // console.log(roomArr);
                                        let str = JSON.stringify(roomArr);
                                        // console.log(roomArr.length);
                                        hashData[id] = roomArr;
                                        fs.writeFile(id+".txt", str);
                                        if(exist === 1) {
                                            insightMessage.code = 201;
                                            insightMessage.body = roomArr;
                                            fulfill(insightMessage);
                                        }else {
                                            insightMessage.code = 204;
                                            insightMessage.body = roomArr;
                                            fulfill(insightMessage);
                                        }
                                    })
                                        .catch(function (stuff:InsightResponse){
                                            stuff = {code:400 ,body:{"error": "Error in building parsing"}};
                                            reject(stuff);
                                        })
                                }
                            })
                            .catch(function (stuff:InsightResponse){
                                stuff = {code:400 ,body:{"error": "Error in latlon promises"}};
                                reject(stuff);
                            })
                    })
                        .catch(function (stuff:InsightResponse){
                            stuff = {code:400 ,body:{"error": "Error in reading index.htm"}};
                            reject(stuff);
                        })
                })
                    .catch(function (stuff:InsightResponse){
                        stuff = {code:400 ,body:{"error": "Error in unzipping the files"}};
                        reject(stuff);
                    })
            }

            else if(id === "courses"){
                var arrayPromise:any[] = [];
                var objArr:any[] = [];

                console.log("Base64 content being read");

                JSZip.loadAsync(content, {base64: true}).then(function (unZipped: any) {
                    console.log("read the unzipped data");

                    //files are all the unzipped files
                    let files = unZipped.files;
                    //files is an object not an array
                    console.log('is array: ' + Array.isArray(files));
                    console.log('Unzippled files are ' + typeof (files));
                    //we iterate the files using filename as a key
                    for (let filename in files)  {
                        //we find the individual fies, if they are valid, push them into async promise array
                        let file = unZipped.file(filename);
                        if(file){
                            arrayPromise.push(file.async("string"));
                        }
                    }
                    /*
                     console.log("before promise.all");
                     */
                    //We get the asyn promise array which are now strings
                    //We need to parse the data and store them on disk
                    Promise.all(arrayPromise)
                        .then(function (jArray:string[]){
                            for (var i=0;i<jArray.length;i++){
                                var o = JSON.parse(jArray[i]);
                                // console.log(o.result);
                                if(o.result != []) {
                                    //result is an array which include different sections

                                    for (var v of o.result) {
                                        /*if(v.Subject || v.Course || v.Avg || v.Professor || v.Title || v.Pass || v.Fail || v.Audit || v.id)*/
                                        if(v!=[]){
                                            var obj: C = <C>{};
                                            obj.courses_dept = v.Subject;
                                            obj.courses_id = v.Course;
                                            obj.courses_avg = v.Avg;
                                            obj.courses_instructor = v.Professor
                                            obj.courses_title = v.Title;
                                            obj.courses_pass = v.Pass;
                                            obj.courses_fail = v.Fail;
                                            obj.courses_audit = v.Audit;
                                            obj.courses_uuid = v.id;
                                            obj.courses_size = v.Pass + v.Fail;
                                            if(v.Section == "overall"){
                                                obj.courses_year = 1900;
                                            }else{
                                                obj.courses_year = v.Year;
                                            }
                                            objArr.push(obj);
                                            //if one of the char doesn't exits, what happen "="
                                        }
                                    }
                                }
                            }

                            let str = JSON.stringify(objArr);
                            hashCourseData[id] = objArr;
                            fs.writeFile(id+".txt", str);

                            //console.log(exist);
                            if(exist === 1) {
                                insightMessage.code = 201;
                                insightMessage.body = {201: "the operation was successful and the id was existed"};
                                fulfill(insightMessage);
                            }else {
                                insightMessage.code = 204;
                                insightMessage.body = {204: "the operation was successful and the id was new"};
                                fulfill(insightMessage);
                            }
                        })
                        .catch(function(err:InsightResponse){
                            err = {code:400 ,body:{"error": "Array of asyn Promises failed"}};
                            reject(err);
                        });
                })
                    .catch(function (stuff:InsightResponse){
                        stuff = {code:400 ,body:{"error": "Error in unzipping the files"}};
                        reject(stuff);
                    })
            }
            else {
                insightMessage = {code:400 ,body:{"error": "Unacceptable IDs"}};
                reject(insightMessage);
            }
        });
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise(function(fulfill, reject){

            if(fs.existsSync(id+".txt")){
                fs.truncate(id+".txt",0);
                fs.unlinkSync(id+".txt");
                // fs.truncate(id+".txt",0);
                hashData[id] = {};
                delete hashData[id];//?
                message.code = 204;
                message.body = {id: "the operation was successful"};
                fulfill(message);
            }
            else{
                message.code = 404;
                message.body = {"error": "the operation was unsuccessful because the delete was for a resource that was not previously added"};
                reject(message);
            }
            // var p = fs.unlink(id+".txt",function () {
            // //fs.unlink(id+".txt",0);
            // console.log("00");
            //     })
            //
            //     .then(function () {
            //
            //         console.log("then");
            //     fs.truncate(id+".txt",0);
            //     message.code = 204;
            //     message.body = {id: "the operation was successful"};
            //     fulfill(message);
            // }).catch(function (err:InsightResponse) {
            //     err.code = 404;
            //     err.body = {"error": "the operation was unsuccessful because the delete was for a resource thatwas not previously added"};
            //     reject(err);
            // })
        })
    }

    getDataSet(){
        return hashData;
    }

    getCourseDataset(){
        return hashCourseData;
    }

}

function findNode(html:any, name:string):any{
    //console.log(html.nodeName);
    var returnNodes:any = [];

    if(html.nodeName === name) {
        returnNodes.push(html);
        //console.log(returnNodes);

        return returnNodes;
    }


    if(html.childNodes != undefined){

        let childArray:any =  html.childNodes;

        //if(childArray === undefined) console.log(55);

        for(let child of childArray){
            //console.log(child.nodeName);
            let t = findNode(child, name);
            if(t.length != 0) {
                //console.log(t);
                returnNodes = returnNodes.concat(t);
                //console.log(returnNodes);

            }
        }
        return returnNodes;
    }
    //console.log(222);
    return [];
}

function latlonhelper(geourl:string){
    return new Promise(function(fulfill, reject){
        http.get(geourl, (res:any) => {
            let rawData = '';
            res.on('data', (chunk:any) => rawData += chunk);
            res.on('end', () => {
                try {
                    //console.log(rawData);
                    let parsedData = JSON.parse(rawData);
                    fulfill(parsedData);

                } catch (e) {
                    console.log(e.message);
                }
            });
        }).on('error', (e:any) => {
            console.log(`Got error: ${e.message}`);
        });
    })
}
//??
function distanceHelper(buildSelf:any, buildingArr:any) {
    var buildSelfDis = [];
    for(let building of buildingArr){

        //console.log(building);
        var lat1:number = buildSelf.lat;
        var lat2:number = building.lat;
        var lon1:number = buildSelf.lon;
        var lon2:number = building.lon;

        var d:number = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);

        var buildingName = building.fullname;
        //console.log(d);
        var buildingDis = new Object();
        buildingDis = {buildingName : buildingName, distance: d};
        //console.log(buildingDis);
        buildSelfDis.push(buildingDis);
    }
    return buildSelfDis;
}


function getDistanceFromLatLonInKm(lat1:number,lon1:number,lat2:number,lon2:number) {
    var R:number = 6371000; // Radius of the earth in km
    var dLat:number = deg2rad(lat2-lat1);  // deg2rad below
    var dLon:number = deg2rad(lon2-lon1);
    var a:number =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c:number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d:number = R * c; // Distance in km
    return d;
}

function deg2rad(deg:number) {
    return deg * (Math.PI/180)
}