/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest, C} from "./IInsightFacade";

import Log from "../Util";
import QueryController from "./QueryController";
import DataController from "./DataController";
import {isUndefined} from "util";

var QC = new QueryController();
var DC = new DataController();
var dataset = DC.getDataSet();
var coursedataset = DC.getCourseDataset();


export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
            return DC.addDataset(id,content);
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return DC.removeDataset(id);
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        if (isUndefined(query.OPTIONS.COLUMNS)||query.OPTIONS.COLUMNS.length===0)
            return QC.invalidQueryPromise();
        else if (query.OPTIONS.COLUMNS[0].includes("courses")) {
            return QC.performQuery(query, coursedataset);
        }
        else if (query.OPTIONS.COLUMNS[0].includes("rooms")) {
            return QC.performQuery(query, dataset);
        }
    }

    // performQuery_dis(query: QueryRequest, dis: number, eq: string, building: string): Promise<InsightResponse> {
    //     var query_result = QC.performQuery(query, dataset);
    //
    //     if( eq == "GT") {
    //         var dis_room:any;
    //
    //         // find the dis_room from dataset
    //         for(let room of dataset){
    //             if(room.rooms_fullname == building){
    //                 dis_room = room;
    //                 break;
    //             }
    //         }
    //
    //         var results = [];
    //
    //         for(var d of dis_room.rooms_dis){
    //             if( d.distance > dis) {
    //                 results.push(d.building);
    //             }
    //         }
    //
    //
    //
    //
    //     } else {
    //
    //     }
    // }
}