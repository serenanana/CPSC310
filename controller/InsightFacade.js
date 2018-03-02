"use strict";
var Util_1 = require("../Util");
var QueryController_1 = require("./QueryController");
var DataController_1 = require("./DataController");
var util_1 = require("util");
var QC = new QueryController_1.default();
var DC = new DataController_1.default();
var dataset = DC.getDataSet();
var coursedataset = DC.getCourseDataset();
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        return DC.addDataset(id, content);
    };
    InsightFacade.prototype.removeDataset = function (id) {
        return DC.removeDataset(id);
    };
    InsightFacade.prototype.performQuery = function (query) {
        if (util_1.isUndefined(query.OPTIONS.COLUMNS) || query.OPTIONS.COLUMNS.length === 0)
            return QC.invalidQueryPromise();
        else if (query.OPTIONS.COLUMNS[0].includes("courses")) {
            return QC.performQuery(query, coursedataset);
        }
        else if (query.OPTIONS.COLUMNS[0].includes("rooms")) {
            return QC.performQuery(query, dataset);
        }
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map