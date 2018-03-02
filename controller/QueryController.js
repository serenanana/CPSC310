"use strict";
var Util_1 = require("../Util");
var util_1 = require("util");
var hashData = {};
var fs = require("fs");
var message = {};
var roomKeys = ["rooms_dis", "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address", "rooms_lat", "rooms_lon", "rooms_seats", "rooms_type", "rooms_furniture", "rooms_href"];
var courseKeys = ["courses_dept", "courses_id", "courses_avg", "courses_instructor", "courses_title", "courses_pass", "courses_fail", "courses_audit", "courses_uuid", "courses_year", "courses_size"];
var QueryController = (function () {
    function QueryController() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    QueryController.prototype.performQuery = function (query, data) {
        return new Promise(function (fulfill, reject) {
            hashData = data;
            var message = {};
            for (var id in hashData) {
                if (fs.existsSync(id + ".txt")) {
                    console.log("existed");
                }
                else {
                    message.code = 424;
                    message.body = { "missing": [id] };
                    return reject(message);
                }
            }
            if (Object.keys(hashData).length === 0 && hashData.constructor === Object) {
                message.code = 424;
                message.body = { "error": "No info for query" };
                return reject(message);
            }
            else {
                var where = query.WHERE;
                var options = query.OPTIONS;
                var columns = options.COLUMNS;
                var order = options.ORDER;
                var from = options.FORM;
                var wherekey;
                for (var key_1 in where) {
                    wherekey = key_1;
                }
                var orderKeys;
                if (order) {
                    if (typeof order === "object") {
                        var dir = order["dir"];
                        orderKeys = order["keys"];
                    }
                    else {
                        orderKeys = [order];
                    }
                }
                else {
                    orderKeys = [];
                }
                if (orderKeys != []) {
                    for (var _i = 0, orderKeys_1 = orderKeys; _i < orderKeys_1.length; _i++) {
                        var ord = orderKeys_1[_i];
                        if (!columns.includes(ord)) {
                            message.code = 400;
                            message.body = { "error": "Order keys need to be in columns" };
                            return reject(message);
                        }
                    }
                }
                if (util_1.isUndefined(where) || util_1.isUndefined(options)) {
                    message.code = 400;
                    message.body = { "error": "Query format is not set up properly" };
                    return reject(message);
                }
                else if (util_1.isUndefined(columns) || util_1.isUndefined(from) || columns.length === 0) {
                    message.code = 400;
                    message.body = { "error": "Option format is not set up properly" };
                    return reject(message);
                }
                else if (from != "TABLE") {
                    message.code = 400;
                    message.body = { "error": "FORM is not set up properly" };
                    return reject(message);
                }
                else {
                    var include = 0;
                    for (var _a = 0, columns_1 = columns; _a < columns_1.length; _a++) {
                        var column = columns_1[_a];
                        if (order === column) {
                            include = 1;
                        }
                    }
                    if (include === 0 && (typeof order === "string")) {
                        message.code = 400;
                        message.body = { "error": "Order not in column" };
                        return reject(message);
                    }
                    else {
                        var filterData = logicHelper(wherekey, where);
                        var transform = query.TRANSFORMATIONS;
                        if (transform) {
                            var group = transform.GROUP;
                            var apply = transform.APPLY;
                            if (util_1.isUndefined(apply) || util_1.isUndefined(group)) {
                                message.code = 400;
                                message.body = { "error": "invalid transform" };
                                return reject(message);
                            }
                            if (apply.length > 0) {
                                var invaildAppValue = 0;
                                var inapply = 0;
                                var ingroup = 0;
                                var applyKeys = [];
                                for (var _b = 0, columns_2 = columns; _b < columns_2.length; _b++) {
                                    var colKey = columns_2[_b];
                                    if (group.includes(colKey)) {
                                        ingroup++;
                                    }
                                    else {
                                        for (var _c = 0, apply_1 = apply; _c < apply_1.length; _c++) {
                                            var applyEle = apply_1[_c];
                                            if (typeof applyEle != "object") {
                                                message.code = 400;
                                                message.body = { "error": "invalid apply structure" };
                                                return reject(message);
                                            }
                                            if (Object.keys(applyEle).length > 1) {
                                                message.code = 400;
                                                message.body = { "error": "invalid apply structure" };
                                                return reject(message);
                                            }
                                            var key = Object.keys(applyEle)[0];
                                            if (key.indexOf("_") > -1) {
                                                invaildAppValue = 1;
                                            }
                                            var value = applyEle[key];
                                            if (typeof value != "object") {
                                                message.code = 400;
                                                message.body = { "error": "invalid apply structure" };
                                                return reject(message);
                                            }
                                            if (Object.keys(value).length > 1) {
                                                message.code = 400;
                                                message.body = { "error": "invalid apply structure" };
                                                return reject(message);
                                            }
                                            var applyKey = Object.keys(value)[0];
                                            var appKeyArr = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
                                            if (!appKeyArr.includes(applyKey)) {
                                                message.code = 400;
                                                message.body = { "error": "invalid apply structure" };
                                                return reject(message);
                                            }
                                            if (colKey == key) {
                                                inapply++;
                                            }
                                            applyKeys.push(key);
                                        }
                                    }
                                }
                                if (inapply + ingroup != columns.length) {
                                    message.code = 400;
                                    message.body = { "error": "invalid Column" };
                                    return reject(message);
                                }
                                if (invaildAppValue == 1) {
                                    message.code = 400;
                                    message.body = { "error": "invalid apply key" };
                                    return reject(message);
                                }
                            }
                            var groupResult = groupHelper(filterData, group);
                            if (!Array.isArray(groupResult)) {
                                reject(groupResult);
                            }
                            var applyArr = applyHelper(groupResult, apply);
                            if (!Array.isArray(applyArr)) {
                                reject(applyArr);
                            }
                        }
                        if (!Array.isArray(filterData)) {
                            reject(filterData);
                        }
                        var inOrder;
                        if (applyArr) {
                            filterData = applyArr;
                        }
                        if (columns[0].valueOf().includes("rooms")) {
                            inOrder = orderRoomHelper(filterData, orderKeys, columns);
                        }
                        else {
                            inOrder = orderHelper(filterData, orderKeys, columns);
                        }
                        if (!Array.isArray(inOrder)) {
                            reject(inOrder);
                        }
                        if (dir === "DOWN") {
                            inOrder.reverse();
                        }
                        var pquery = { "render": from, "result": inOrder };
                        message.code = 200;
                        message.body = pquery;
                        fulfill(message);
                    }
                }
            }
        });
    };
    QueryController.prototype.invalidQueryPromise = function () {
        return new Promise(function (fulfill, reject) {
            var message = {};
            message.code = 400;
            message.body = { "error": "No COLUMN for query" };
            return reject(message);
        });
    };
    return QueryController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryController;
function logicHelper(key, where) {
    switch (key) {
        case "AND":
            if (where["AND"].length <= 1) {
                message.code = 400;
                message.body = { 400: "Empty AND should result in 400." };
                return (message);
            }
            var orArray = where["AND"];
            var hs = [];
            var result = [];
            for (var _i = 0, orArray_1 = orArray; _i < orArray_1.length; _i++) {
                var con_1 = orArray_1[_i];
                var k = Object.keys(con_1)[0];
                var h = logicHelper(k, con_1);
                hs.push(h);
            }
            result = hs.shift().filter(function (v) {
                return hs.every(function (a) {
                    return a.indexOf(v) !== -1;
                });
            });
            return result;
        case "OR":
            if (where["OR"].length === 0) {
                message.code = 400;
                message.body = { 400: "Empty OR should result in 400." };
                return (message);
            }
            var orArray = where["OR"];
            var hs = [];
            var result = [];
            for (var _a = 0, orArray_2 = orArray; _a < orArray_2.length; _a++) {
                var con_2 = orArray_2[_a];
                var k = Object.keys(con_2)[0];
                var h = logicHelper(k, con_2);
                hs.push(h);
            }
            for (var _b = 0, hs_1 = hs; _b < hs_1.length; _b++) {
                var objarr = hs_1[_b];
                for (var _c = 0, objarr_1 = objarr; _c < objarr_1.length; _c++) {
                    var obj = objarr_1[_c];
                    result.push(obj);
                }
            }
            result.filter(function (item, pos) { return result.indexOf(item) === pos; });
            return result;
        case "IS":
            var keys = Object.keys(where["IS"]);
            var con = keys[0];
            if (roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con) == -1) {
                message.code = 400;
                message.body = { 400: "InvalidKey should result in 400" };
                return (message);
            }
            var value = where["IS"][con];
            if (typeof value != "string") {
                message.code = 400;
                message.body = { 400: "Invalid IS should result in 400" };
                return (message);
            }
            var is = isHelper(con, value);
            return is;
        case "NOT":
            var keys = Object.keys(where["NOT"]);
            var con = keys[0];
            var value = where["NOT"][con];
            var not = notHelper(con, value);
            return not;
        case "GT":
            var keys = Object.keys(where["GT"]);
            var con = keys[0];
            if (roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con) == -1) {
                message.code = 400;
                message.body = { 400: "InvalidKey should result in 400" };
                return (message);
            }
            var value = where["GT"][con];
            if (typeof value != "number") {
                message.code = 400;
                message.body = { 400: "Invalid GT should result in 400" };
                return (message);
            }
            var gt = gtHelper(con, value);
            return gt;
        case "LT":
            var keys = Object.keys(where["LT"]);
            var con = keys[0];
            if (roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con) == -1) {
                message.code = 400;
                message.body = { 400: "InvalidKey should result in 400" };
                return (message);
            }
            var value = where["LT"][con];
            if (typeof value != "number") {
                message.code = 400;
                message.body = { 400: "Invalid LT should result in 400" };
                return (message);
            }
            var lt = ltHelper(con, value);
            return lt;
        case "EQ":
            var keys = Object.keys(where["EQ"]);
            var con = keys[0];
            if (roomKeys.indexOf(con) == -1 && courseKeys.indexOf(con) == -1) {
                message.code = 400;
                message.body = { 400: "InvalidKey should result in 400" };
                return (message);
            }
            var value = where["EQ"][con];
            if (typeof value != "number") {
                message.code = 400;
                message.body = { 400: "Invalid EQ should result in 400" };
                return (message);
            }
            var eq = eqisHelper(con, value);
            return eq;
        default:
            var objs = [];
            for (var id in hashData) {
                for (var _d = 0, _e = hashData[id]; _d < _e.length; _d++) {
                    var obj = _e[_d];
                    objs.push(obj);
                }
            }
            return objs;
    }
}
function gtHelper(con, value) {
    var objs = [];
    for (var id in hashData) {
        for (var _i = 0, _a = hashData[id]; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj[con] > value) {
                objs.push(obj);
            }
        }
    }
    return objs;
}
function ltHelper(con, value) {
    var objs = [];
    for (var id in hashData) {
        for (var _i = 0, _a = hashData[id]; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj[con] < value) {
                objs.push(obj);
            }
        }
    }
    return objs;
}
function isHelper(con, value) {
    var objs = [];
    for (var id in hashData) {
        for (var _i = 0, _a = hashData[id]; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (matchRuleShort(obj[con], value)) {
                objs.push(obj);
            }
        }
    }
    return objs;
}
function eqisHelper(con, value) {
    var objs = [];
    for (var id in hashData) {
        for (var _i = 0, _a = hashData[id]; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj[con] === value) {
                objs.push(obj);
            }
        }
    }
    return objs;
}
function notHelper(con, value) {
    switch (con) {
        case "AND":
            return logicHelper("OR", { "OR": value });
        case "OR":
            return logicHelper("AND", { "AND": value });
        case "IS":
            var keys = Object.keys(value);
            var iskey = keys[0];
            if (roomKeys.indexOf(iskey) == -1 && courseKeys.indexOf(iskey) == -1) {
                message.code = 400;
                message.body = { 400: "InvalidKey should result in 400" };
                return (message);
            }
            var isvalue = value[iskey];
            var objs = [];
            for (var id in hashData) {
                for (var _i = 0, _a = hashData[id]; _i < _a.length; _i++) {
                    var obj = _a[_i];
                    if (matchRuleShort(obj[iskey], isvalue)) {
                    }
                    else {
                        objs.push(obj);
                    }
                }
            }
            return objs;
        case "NOT":
            var keys = Object.keys(value);
            var notkey = keys[0];
            return logicHelper(notkey, value);
        case "GT":
            return logicHelper("LT", { "LT": value });
        case "LT":
            return logicHelper("GT", { "GT": value });
        case "EQ":
            var keys = Object.keys(value);
            var eqkey = keys[0];
            if (roomKeys.indexOf(eqkey) == -1 && courseKeys.indexOf(eqkey) == -1) {
                message.code = 400;
                message.body = { 400: "InvalidKey should result in 400" };
                return (message);
            }
            var eqvalue = value[eqkey];
            var objs = [];
            for (var id in hashData) {
                for (var _b = 0, _c = hashData[id]; _b < _c.length; _b++) {
                    var obj = _c[_b];
                    if (obj[eqkey] != eqvalue) {
                        objs.push(obj);
                    }
                }
            }
            return objs;
    }
}
function orderHelper(data, orderKeys, columns) {
    var objs = [];
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var obj = data_1[_i];
        var newObj = {};
        for (var i = 0; i < columns.length; i++) {
            var char = columns[i];
            switch (char) {
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
                    if (util_1.isUndefined(obj[char])) {
                        message.code = 400;
                        message.body = { 400: "invalid key" };
                        return (message);
                    }
                    else {
                        newObj[char] = obj[char];
                    }
                    break;
            }
        }
        objs.push(newObj);
    }
    if (orderKeys == []) {
        return objs;
    }
    var sortedUpData = objs.sort(orderByKeys(orderKeys));
    return sortedUpData;
}
function orderRoomHelper(data, orderKeys, columns) {
    var objs = [];
    for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
        var obj = data_2[_i];
        var newObj = {};
        for (var i = 0; i < columns.length; i++) {
            var char = columns[i];
            switch (char) {
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
                    if (util_1.isUndefined(obj[char])) {
                        message.code = 400;
                        message.body = { "error": "invalid key" };
                        return (message);
                    }
                    else {
                        newObj[char] = obj[char];
                    }
                    break;
            }
        }
        objs.push(newObj);
    }
    if (orderKeys == []) {
        return objs;
    }
    var sortedUpData = objs.sort(orderByKeys(orderKeys));
    return sortedUpData;
}
function matchRuleShort(str, rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
}
function groupHelper(data, keys) {
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key_2 = keys_1[_i];
        if (roomKeys.indexOf(key_2) == -1 && courseKeys.indexOf(key_2) == -1) {
            message.code = 400;
            message.body = { 400: "InvalidKey should result in 400" };
            return (message);
        }
    }
    var key = keys[0];
    var result = [];
    for (var _a = 0, data_3 = data; _a < data_3.length; _a++) {
        var d = data_3[_a];
        var i = exist(key, d[key], result);
        if (i != -1) {
            result[i].push(d);
        }
        else {
            var newArr = [];
            newArr.push(d);
            result.push(newArr);
        }
    }
    if (keys.length == 1) {
        return result;
    }
    else {
        var nkeys = keys.splice(1);
        var results = [];
        for (var _b = 0, result_1 = result; _b < result_1.length; _b++) {
            var arrOfResult = result_1[_b];
            var arr = groupHelper(arrOfResult, nkeys);
            results.push.apply(results, arr);
        }
        return results;
    }
}
function exist(key, value, result) {
    for (var i = 0; i < result.length; i++) {
        if (result[i][0][key] == value) {
            return i;
        }
    }
    return -1;
}
function applyHelper(groupData, apply) {
    var applyArr = [];
    if (apply != []) {
        for (var _i = 0, apply_2 = apply; _i < apply_2.length; _i++) {
            var applyEle = apply_2[_i];
            var key = Object.keys(applyEle)[0];
            var value = applyEle[key];
            var applyKey = Object.keys(value)[0];
            var applyValue = value[applyKey];
            if (roomKeys.indexOf(applyValue) == -1 && courseKeys.indexOf(applyValue) == -1) {
                message.code = 400;
                message.body = { 400: "InvalidKey should result in 400" };
                return (message);
            }
            for (var _a = 0, groupData_1 = groupData; _a < groupData_1.length; _a++) {
                var group = groupData_1[_a];
                if (applyKey != "COUNT") {
                    if (typeof group[0][applyValue] != "number") {
                        message.code = 400;
                        message.body = { 400: "Invalid field for apply" };
                        return message;
                    }
                }
                var val = computeApply(group, applyValue, applyKey);
                group[0][key] = val;
            }
        }
    }
    for (var _b = 0, groupData_2 = groupData; _b < groupData_2.length; _b++) {
        var group = groupData_2[_b];
        applyArr.push.apply(applyArr, group.slice(0, 1));
    }
    return applyArr;
}
function computeApply(applyData, key, token) {
    var max = -1, min = 1000000, avg, sum = 0, size, count = 0, total = 0;
    size = applyData.length;
    var preValArr = [];
    for (var _i = 0, applyData_1 = applyData; _i < applyData_1.length; _i++) {
        var a = applyData_1[_i];
        var val = a[key];
        if (preValArr.indexOf(val) == -1) {
            count++;
            preValArr.push(val);
        }
        if (val > max) {
            max = val;
        }
        if (val < min) {
            min = val;
        }
        total += Number((val * 10).toFixed(0));
    }
    sum = total / 10;
    avg = Number((sum / size).toFixed(2));
    switch (token) {
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
//# sourceMappingURL=QueryController.js.map