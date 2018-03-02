import {InsightResponse, QueryRequest, C, Room} from "./IInsightFacade";

import Log from "../Util";
import {isUndefined} from "util";

var hashData:any = {};
var fs = require ("fs");
var message:InsightResponse = <InsightResponse>{};
var roomKeys:any = ["rooms_dis","rooms_fullname","rooms_shortname", "rooms_number","rooms_name","rooms_address", "rooms_lat", "rooms_lon", "rooms_seats","rooms_type","rooms_furniture","rooms_href" ];
var courseKeys:any = ["courses_dept","courses_id","courses_avg","courses_instructor","courses_title","courses_pass","courses_fail","courses_audit","courses_uuid","courses_year","courses_size"];

export default class QueryController {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    performQuery(query: QueryRequest, data: Object): Promise <InsightResponse> {
        return new Promise(function(fulfill, reject){

            //console.log(hashData);
            hashData = data;

            var message:InsightResponse = <InsightResponse>{};

            for (var id in hashData) {
                                if(fs.existsSync(id+".txt")){
                                       console.log("existed");
                                    }
                                else{
                                        message.code = 424;
                                        message.body = {"missing": [id]};
                                        return reject(message);
                                    }
                            }

            if(Object.keys(hashData).length === 0 && hashData.constructor === Object){
                message.code = 424;
                message.body = {"error": "No info for query"};
                return reject(message);
            }
            else {
                var where:any = query.WHERE;
                var options:any = query.OPTIONS;
                var columns:string[] = options.COLUMNS;
                var order:any = options.ORDER;
                var from:string = options.FORM;

                var wherekey:string;
                for(let key in where){
                    wherekey = key;
                }


                // var columns:string[] = options.COLUMNS;
                // var order:any = options.ORDER;
                // console.log(typeof order);
                var orderKeys:any;
                if(order){
                    if(typeof order === "object"){
                        var dir:string = order["dir"];
                        orderKeys = order["keys"];
                    }else{
                        orderKeys = [order];
                    }
                }else{
                    orderKeys = [];
                }
                if(orderKeys != []){
                    for (var ord of orderKeys){
                        if (!columns.includes(ord)){
                            message.code = 400;
                            message.body = {"error": "Order keys need to be in columns"};
                            return reject(message);
                        }
                    }
                }

                // var from:string = options.FORM;

                //If the order variable is not included in the column variable, reject


                if (isUndefined(where) || isUndefined(options)) {
                    message.code = 400;
                    message.body = {"error": "Query format is not set up properly"};
                    return reject(message);
                }

                else if (isUndefined(columns) || isUndefined(from)||columns.length===0) {
                    message.code = 400;
                    message.body = {"error": "Option format is not set up properly"};
                    return reject(message);
                }
                // else if (!(matchRuleShort(order,"rooms*")||matchRuleShort(order,"courses*")||isUndefined(order))) {
                //     message.code = 400;
                //     message.body = {"error": "Order is not part of rooms or courses"};
                //     return reject(message);
                // }


                else if(from != "TABLE"){
                    message.code = 400;
                    message.body = {"error": "FORM is not set up properly"};
                    return reject(message);
                }
                else {
                    var include = 0;
                    for(let column of columns){
                        if(order === column){
                            include = 1;
                        }
                    }

                    if(include === 0 &&  (typeof order === "string")){
                        message.code = 400;
                        message.body = {"error": "Order not in column"};
                        return reject(message);
                    }


                    else {

                        var filterData = logicHelper(wherekey, where);//only one key in where

                        var transform = query.TRANSFORMATIONS;
                        if(transform) {
                            var group:any = transform.GROUP;
                            var apply:any = transform.APPLY;

                            if(isUndefined(apply)||isUndefined(group)){
                                message.code = 400;
                                message.body = {"error": "invalid transform"};
                                return reject(message);
                            }

                            if(apply.length>0){
                                var invaildAppValue = 0;
                                var inapply = 0;
                                var ingroup = 0;
                                var applyKeys: string[] = [];

                                for(let colKey of columns){
                                    if(group.includes(colKey)){
                                        //exist in group
                                        ingroup++;
                                    }
                                    else {
                                        for(var applyEle of apply){
                                            if(typeof applyEle != "object"){
                                                message.code=400;
                                                message.body = {"error":"invalid apply structure"}
                                                return reject(message);
                                            }
                                            if(Object.keys(applyEle).length>1){
                                                message.code=400;
                                                message.body = {"error":"invalid apply structure"}
                                                return reject(message);
                                            }
                                            var key:string = Object.keys(applyEle)[0]; //maxSeats
                                            if(key.indexOf("_")> -1){
                                                invaildAppValue = 1;
                                            }
                                            var value:any = applyEle[key];
                                            if(typeof value != "object"){
                                                message.code=400;
                                                message.body = {"error":"invalid apply structure"}
                                                return reject(message);
                                            }
                                            if(Object.keys(value).length>1){
                                                message.code=400;
                                                message.body = {"error":"invalid apply structure"}
                                                return reject(message);
                                            }
                                            var applyKey:string = Object.keys(value)[0];
                                            var appKeyArr = ["MAX","MIN","AVG","SUM","COUNT"];
                                            if(!appKeyArr.includes(applyKey)){
                                                message.code=400;
                                                message.body = {"error":"invalid apply structure"}
                                                return reject(message);
                                            }
                                            //console.log(invaildAppValue);
                                            if(colKey == key){
                                                inapply++;
                                            }
                                            applyKeys.push(key) ;
                                        }
                                    }
                                }
                                if(inapply+ingroup!=columns.length){
                                    message.code = 400;
                                    message.body = {"error": "invalid Column"};
                                    return reject(message);
                                }
                                // console.log(group);
                                if(invaildAppValue == 1){
                                    message.code = 400;
                                    message.body = {"error": "invalid apply key"};
                                    return reject(message);
                                }

                            }
                            // if(orderKeys != []){
                            //     for (var ord of orderKeys){
                            //         if(!applyKeys.includes(ord)){
                            //             message.code = 400;
                            //             message.body = {"error": "Order not in apply or column"};
                            //             return reject(message);
                            //         }
                            //     }
                            // }

                            var groupResult = groupHelper(filterData,group);
                            if(!Array.isArray(groupResult)){
                                reject(groupResult);
                            }

                            var applyArr = applyHelper(groupResult,apply);
                            if(!Array.isArray(applyArr)){
                                reject(applyArr);
                            }

                        }

                        //If filterData returns an insightFacade (not an array of objects), reject the filterData
                        if(!Array.isArray(filterData)){
                            reject(filterData);
                        }

                        //  console.log(filterData);
                        var inOrder;
                        if(applyArr){
                            filterData = applyArr;
                        }

                        if(columns[0].valueOf().includes("rooms")){
                            inOrder = orderRoomHelper(filterData, orderKeys, columns);
                        }
                        else {
                            inOrder = orderHelper(filterData, orderKeys, columns);
                        }
                        //console.log(orderKeys);
                        if(!Array.isArray(inOrder)){
                            reject(inOrder);
                        }

                        if(dir === "DOWN"){
                            inOrder.reverse();
                        }
                        //console.log(inOrder);
                        var pquery:any = {"render": from, "result": inOrder};
                        //console.log(pquery);

                        message.code = 200;
                        message.body = pquery;
                        //console.log(message);
                        fulfill(message);
                    }
                }

            }
        })
    }

    invalidQueryPromise():Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            var message:InsightResponse = <InsightResponse>{};
            message.code = 400;
            message.body = {"error": "No COLUMN for query"};
            return reject(message) ;
        })
    }
}


function logicHelper(key:string, where:any ):any{ //consumes wherekey and where, return objs in dataset
 switch(key){
        case "AND":
            if(where["AND"].length <= 1){
                message.code = 400;
                message.body = {400: "Empty AND should result in 400."};
                return(message);
            }

            var orArray:any[] = where["AND"];

            var hs:any[] = [];

            var result:any[] = [];

            for(let con of orArray){
                var k = Object.keys(con)[0];
                //console.log(k);
                var h = logicHelper(k,con);
                // console.log(h);
                hs.push(h);
            }
            //console.log(hs);
            result = hs.shift().filter(function(v:any
            ) {
                return hs.every(function(a) {
                    return a.indexOf(v) !== -1;
                });
            });

            return result;

        case "OR":
            if(where["OR"].length === 0){
                message.code = 400;
                message.body = {400: "Empty OR should result in 400."};
                return(message);
            }

            var orArray:any[] = where["OR"]; //two or more logic array in "OR" value
            var hs:any[] = [];

            var result:any[] = []; //dataset

            for(let con of orArray){ //obtained hs is an array contains two or more objs(obj array)
                var k = Object.keys(con)[0];//con's key, only one which is "AND"
                var h = logicHelper(k,con);
                //console.log(h);
                hs.push(h);
            }

            for(let objarr of hs){
                for(let obj of objarr){
                    result.push(obj);
                }
            }
            result.filter(function (item, pos) {return result.indexOf(item) === pos});
            //console.log(result.length);

            return result;

        case "IS":
            var keys:string[] = Object.keys(where["IS"]);
            var con = keys[0];
            if(roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con)==-1){
                message.code = 400;
                message.body = {400: "InvalidKey should result in 400"};
                return(message);
            }
            var value = where["IS"][con]; //adhe // actual info to compare with
            if(typeof value != "string"){
                message.code = 400;
                message.body = {400: "Invalid IS should result in 400"};
                return(message);
            }

            //console.log(value);
            var is = isHelper(con,value);
            //console.log(is);
            return is;

        case "NOT":
            var keys:string[] = Object.keys(where["NOT"]); //keys in not
            var con = keys[0]; //the first key (actually there is only one key)
            var value = where["NOT"][con];
            var not = notHelper(con, value);
            return not;

        case "GT":
            var keys:string[] = Object.keys(where["GT"]);//keys in gt
            var con = keys[0]; //course_avg
            if(roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con)==-1){
                message.code = 400;
                message.body = {400: "InvalidKey should result in 400"};
                return(message);
            }
            var value = where["GT"][con]; //97

            if(typeof value != "number"){
                message.code = 400;
                message.body = {400: "Invalid GT should result in 400"};
                return(message);
            }
            //console.log(value);
            var gt = gtHelper(con,value);
            // console.log(gt);
            return gt;

        case "LT":

            var keys:string[] = Object.keys(where["LT"]);
            var con = keys[0];
            if(roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con)==-1){
                message.code = 400;
                message.body = {400: "InvalidKey should result in 400"};
                return(message);
            }
            var value = where["LT"][con];
            if(typeof value != "number"){
                message.code = 400;
                message.body = {400: "Invalid LT should result in 400"};
                return(message);
            }
            //console.log(value);
            var lt = ltHelper(con,value);
            //console.log(lt);
            return lt;

        case "EQ":

            var keys:string[] = Object.keys(where["EQ"]);
            var con = keys[0];
            if(roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con)==-1){
                message.code = 400;
                message.body = {400: "InvalidKey should result in 400"};
                return(message);
            }
            var value = where["EQ"][con];
            if(typeof value != "number"){
                message.code = 400;
                message.body = {400: "Invalid EQ should result in 400"};
                return(message);
            }
            //console.log(value);
            var eq = eqisHelper(con,value);
            //console.log(eq);
            return eq;
        default:
            var objs:any[] =[];
            for(var id in hashData){
                for(let obj of hashData[id]){
                    objs.push(obj);
                }
            }
            return objs;
    }
}

function gtHelper(con:string, value:number):any{

    var objs:any[] =[];

    for(var id in hashData){
        for(let obj of hashData[id]){
            if(obj[con] > value){
                objs.push(obj);
            }
        }
    }
    return objs;
}

function ltHelper(con:string, value:number):any {

    var objs: any[] = [];

    for (var id in hashData) {
        for (let obj of hashData[id]) {
            if (obj[con] < value) {
                objs.push(obj);
            }
        }
    }
    return objs;
}

function isHelper(con:string, value:any):any {

    var objs: any[] = [];

    for (var id in hashData) {
        for (let obj of hashData[id]) {
            if (matchRuleShort(obj[con],value)) {
                objs.push(obj);
            }
        }
    }
    return objs;
}

function eqisHelper(con:string, value:any):any {

    var objs: any[] = [];

    for (var id in hashData) {
        for (let obj of hashData[id]) {
            if (obj[con] === value) {
                objs.push(obj);
            }
        }
    }
    return objs;
}

function notHelper(con:string, value:any):any {
    switch(con){
        case "AND":
            return logicHelper("OR",{"OR":value});

        case "OR":
            return logicHelper("AND",{"AND":value});

        case "IS":
            var keys:string[] = Object.keys(value);
            var iskey = keys[0];//??
            if(roomKeys.indexOf(iskey) == -1 && courseKeys.indexOf(iskey)==-1){
                message.code = 400;
                message.body = {400: "InvalidKey should result in 400"};
                return(message);
            }
            var isvalue = value[iskey];
            var objs: any[] = [];

            for (var id in hashData) {
                for (let obj of hashData[id]) {
                    if (matchRuleShort(obj[iskey],isvalue)) {
                    }else{
                        objs.push(obj);
                    }
                }
            }
            return objs;

        case "NOT":
            var keys:string[] = Object.keys(value);
            var notkey = keys[0];
            return logicHelper(notkey,value);

        case "GT":
            return logicHelper("LT",{"LT":value});

        case "LT":
            return logicHelper("GT",{"GT":value});

        case "EQ":
            var keys:string[] = Object.keys(value);
            var eqkey = keys[0];//??
            if(roomKeys.indexOf(eqkey) == -1 && courseKeys.indexOf(eqkey)==-1){
                message.code = 400;
                message.body = {400: "InvalidKey should result in 400"};
                return(message);
            }
            var eqvalue = value[eqkey];

            var objs: any[] = [];

            for (var id in hashData) {
                for (let obj of hashData[id]) {
                    if (obj[eqkey] != eqvalue) {
                        objs.push(obj);
                    }
                }
            }
            return objs;
    }
}

function orderHelper(data:any[], orderKeys:string[], columns:string[]):any{
    var objs:any[] = [];
    for(let obj of data){
        var newObj: any =<C>{};
        // console.log(columns.length);

        for(var i = 0; i < columns.length; i++){

            var char:string = columns[i];
            switch(char){
                case "courses_dept":
                    newObj.courses_dept = obj.courses_dept;
                    break;
                case "courses_id":
                    newObj.courses_id = obj.courses_id;
                    break;
                case "courses_avg":
                    newObj.courses_avg = parseFloat(obj.courses_avg);
                    break;
                case "courses_instructor":
                    newObj.courses_instructor = obj.courses_instructor;
                    break;
                case "courses_title":
                    newObj.courses_title = obj.courses_title;
                    break;
                case "courses_pass":
                    newObj.courses_pass = parseInt(obj.courses_pass);
                    break;
                case "courses_fail":
                    newObj.courses_fail = parseInt(obj.courses_fail);
                    break;
                case "courses_audit":
                    newObj.courses_audit = parseInt(obj.courses_audit);
                    break;
                case "courses_uuid":
                    newObj.courses_uuid = obj.courses_uuid;
                    break;
                case "courses_year":
                    newObj.courses_year = parseInt(obj.courses_year);
                    break;
                case "courses_size":
                    newObj.courses_size = parseInt(obj.courses_size);
                    break;
                default:
                    //console.log(obj[char]);
                    if(isUndefined(obj[char])){
                        message.code = 400;
                        message.body = {400: "invalid key"};
                        return(message);
                    } else{
                        newObj[char] = obj[char];
                    }
                    break;
            }
            //console.log(newObj);
        }
        objs.push(newObj);
    }
    //console.log(order);

    // objs.sort(function (a:any,b:any){
    //     return a[order]-b[order];
    // })
    if(orderKeys == []){
        return objs;
    }
    var sortedUpData = objs.sort(orderByKeys(orderKeys));
    // objs.sort(function(a, b) {
    //     var nameA = a[order]; // ignore upper and lowercase
    //     var nameB = b[order]; // ignore upper and lowercase
    //     if (nameA < nameB) {
    //         return -1;
    //     }
    //     if (nameA > nameB) {
    //         return 1;
    //     }
    //
    //     // names must be equal
    //     return 0;
    // });

    return sortedUpData;
}

function orderRoomHelper(data:any[], orderKeys:string[], columns:string[]):any{
    var objs:any[] = [];
    for(let obj of data){
        var newObj: any = <Room>{};
        // console.log(columns.length);

        for(var i = 0; i < columns.length; i++){

            var char:string = columns[i];

            //console.log(char);
            switch(char){
                case "rooms_fullname":
                    newObj.rooms_fullname = obj.rooms_fullname;
                    break;
                case "rooms_shortname":
                    newObj.rooms_shortname = obj.rooms_shortname;
                    break;
                case "rooms_number":
                    newObj.rooms_number = obj.rooms_number;
                    break;
                case "rooms_name":
                    newObj.rooms_name = obj.rooms_name;
                    break;
                case "rooms_address":
                    newObj.rooms_address = obj.rooms_address;
                    break;
                case "rooms_lat":
                    newObj.rooms_lat = obj.rooms_lat;
                    break;
                case "rooms_lon":
                    newObj.rooms_lon = obj.rooms_lon;
                    break;
                case "rooms_seats":
                    newObj.rooms_seats = obj.rooms_seats;
                    break;
                case "rooms_type":
                    newObj.rooms_type = obj.rooms_type;
                    break;
                case "rooms_furniture":
                    newObj.rooms_furniture = obj.rooms_furniture;
                    break;
                case "rooms_href":
                    newObj.rooms_href = obj.rooms_href;
                    break;
                case "rooms_dis":
                    newObj.rooms_dis = obj.rooms_dis;
                    break;
                default:
                    //console.log(obj[char]);
                    if(isUndefined(obj[char])){
                        message.code = 400;
                        message.body = {"error": "invalid key"};
                        return(message);
                    } else{
                        newObj[char] = obj[char];
                    }
                    break;
            }
            //console.log(newObj);
        }
        objs.push(newObj);
    }
    //console.log(order);
    //console.log(objs);
    if(orderKeys == []){
        return objs;
    }
    var sortedUpData = objs.sort(orderByKeys(orderKeys));
    // objs.sort(function(a, b) {
    //
    //     var nameA = a[orderKeys[0]]; // ignore upper and lowercase
    //     var nameB = b[orderKeys[0]]; // ignore upper and lowercase
    //     if (nameA < nameB) {
    //         return -1;
    //     }
    //     if (nameA > nameB) {
    //         return 1;
    //     }
    //
    //     // names must be equal
    //
    //     return 0;
    // });

    return sortedUpData;
}

function matchRuleShort(str:string, rule:string) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
}

function groupHelper(data:any,keys:string[]) : any{
    for(let key of keys){
        if(roomKeys.indexOf(key) == -1 && courseKeys.indexOf(key)==-1){
            message.code = 400;
            message.body = {400: "InvalidKey should result in 400"};
            return(message);
        }
    }
    var key = keys[0]; // shortname
    //console.log(key);

    var result:any = [];//array of array by keys

    for(var d of data){
        let i = exist(key, d[key], result);
        if(i != -1){
            result[i].push(d);
        }else{
            var newArr = [];
            newArr.push(d);
            result.push(newArr);
        }
    }

    //console.log(result);

    if(keys.length == 1){
        return result;
    }else{
        var nkeys = keys.splice(1);
        //console.log("New Keys: ",nkeys);

        var results:any = [];
        for(let arrOfResult of result){
            var arr:any = groupHelper(arrOfResult,nkeys);
            results.push(...arr);
        }
        //console.log(results);

        return results;
    }

}

function exist(key:string, value:any, result:any) :number {
    for(var i = 0; i<result.length; i++){
        if( result[i][0][key] ==  value){
            return i;
        }
    }
    return -1;
}

function applyHelper(groupData:any,apply:any){
    var applyArr:any =[];
    if(apply != []){
        for(var applyEle of apply){
            var key:string = Object.keys(applyEle)[0];
            // console.log("App Key: ", key);
            var value:any = applyEle[key];
            var applyKey:string = Object.keys(value)[0]
            var applyValue:string = value[applyKey];
            //console.log(applyValue);
            if(roomKeys.indexOf(applyValue) == -1 && courseKeys.indexOf(applyValue)==-1){

                message.code = 400;
                message.body = {400: "InvalidKey should result in 400"};
                return(message);
            }
            for(let group of groupData){
                if(applyKey != "COUNT"){
                    if(typeof group[0][applyValue] != "number"){
                        message.code = 400;
                        message.body = {400: "Invalid field for apply"};
                        return message;
                    }
                }
                var val = computeApply(group, applyValue, applyKey);
                // console.log("APPP: ",val);
                group[0][key] = val;
                // console.log(group);
            }
        }
    }

    for(let group of groupData){
        applyArr.push(...group.slice(0,1));
    }
    //console.log(applyArr);
    return applyArr;
}

function computeApply(applyData:any, key:any, token:string) : number{
    var max = -1,min = 1000000, avg ,sum=0,size,count=0,total=0;
    size = applyData.length;

    var preValArr:any = [];
    // var preVal:any = applyData[0][key];
    // preValArr.push(preVal);
    // console.log(preValArr);
    for(var a of applyData){

        let val = a[key];
        //console.log(preValArr.indexOf(val));
        if(preValArr.indexOf(val) == -1){
            count++;
            preValArr.push(val);
        }
        if(val > max){
            max = val;
        }
        if(val < min){
            min = val;
        }
        total += Number((val*10).toFixed(0));
    }
    sum = total/10;
    avg = Number((sum/size).toFixed(2));

    switch(token){
        case "MAX":
            return max;
        case "MIN":
            return min;
        case "SUM":
            return sum;
        case "AVG":
            return avg;
        case "COUNT":
            return count;
        default:
            return -1;
    }
}

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