/**
 * Created by Serenanana on 2017-03-29.
 */

$("#btnSubmit").click(function(){
    var query = $("#txtQuery").val();
    console.log("query", query);

    $.ajax({
        url: 'http://localhost:4321/query',
        type: "post",
        data: query,
        dataType: 'json',
        contentType: 'application/json',
    }).done(function(data){
        console.log("Response",data);
        generateTable(data.result);
    }).fail(function (){
        console.log("ERROR - Failed to submit query");
    })
});

$("#btnQueryRoom").click(function(){
    console.log("CLIKED");
    var query = JSON.stringify(makeRQuery());
    console.log("room query", query);

    $.ajax({
        url: 'http://localhost:4321/query',
        type: "post",
        data: query,
        dataType: 'json',
        contentType: 'application/json'
    }).done(function(data){
        console.log("Room Query Response",data);
        //console.log(data.result.length);
    }).fail(function (){
        console.log("ERROR - Failed to submit query");
    })
});

function makeRQuery() {

    var building =$("#buildingName").val();

    var query = new Object();
    var buildingQ = new Object();
    var distanceQ = new Object();

    var logic = $("#extraFilterR").val();
    var disBuilding = $("#disbuilding").val(); //
    var range = $("#range").val();
    var distance = $("#distance").val();

    if(building != ""){
        buildingQ = {"IS":{"rooms_fullname": building}};
    }

    query.WHERE = buildingQ;

    query.OPTIONS = new Object();
    query.OPTIONS.COLUMNS  = ["rooms_fullname"];
    query.OPTIONS.FORM = "TABLE";
    query.OPTIONS.ORDER = "rooms_fullname";

    console.log(query);
    return query;
    //{building: disBuilding, dis:distance, eq:range, query:query};
}

$("#btnQueryCourse").click(function(){
    var query = JSON.stringify(makeCQuery());
    console.log("query", query);

    $.ajax({
        url: 'http://localhost:4321/query',
        type: "post",
        data: query,
        dataType: 'json',
        contentType: 'application/json'
    }).done(function(data){
        console.log("Course Query Response",data);
        //generateTable(data.result);
    }).fail(function (){
        console.log("ERROR - Failed to submit query");
    })
});

function makeCQuery() {

    var department =$("#department").val();
    var coursenum = $("#coursenum").val();
    var logic = $("#extraFilterC").val();

    var query = new Object();
    var deptQuery = new Object();
    var coursenumQuery = new Object();
    if(department != ""){
        deptQuery = {"IS":{"courses_dept":department.toLowerCase()}};
    }
    if(coursenum != ""){
        coursenumQuery = {"IS":{"courses_id":coursenum}};
    }
    if(logic == "AND"){
        query.WHERE = {"AND": [deptQuery,coursenumQuery]};
    }else{
        query.WHERE = {"OR": [deptQuery,coursenumQuery]};
    }


    query.OPTIONS = new Object();
    query.OPTIONS.COLUMNS  = ["courses_dept", "courses_id"];
    query.OPTIONS.FORM = "TABLE";
    query.OPTIONS.ORDER = "courses_dept"

    console.log(query);
    return query;
}