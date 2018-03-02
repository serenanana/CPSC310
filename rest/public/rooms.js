/**
 * Created by Ian on 2017-03-27.
 */

$("#btnQuerySubmit").click(function(){
    $("tr").remove();
    var query = JSON.stringify(makeQuery());
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

function makeQuery() {
    var buildingName = $("#buildingName").val();
    var buildingNum = $("#buildingNum").val();
    var roomSize = $("#roomSize").val();
    var roomType = $("#roomType").val();
    var furnitureType = $("#furnitureType").val();
    var location =$("#location").val();
    var order = $("#order").val();
    var orderSort = $("#orderSort").val();
    var column = $("#column").val();

    var group = $("#group").val();
    var extraFilter = $("#extraFilter").val();
    var argArr = [];
    var wherearray = [buildingName,buildingNum,roomSize,roomType,furnitureType,location];

    wherearray.forEach(function (ele){
        if (ele != ""){
            argArr.push(ele);
        }
    })


    var query = new Object();
    var nameObj = {
        "IS":{
            "rooms_shortname": buildingName
        }
    }
    var numObj = {
        "IS":{
            "rooms_number": buildingNum
        }
    }
    var sizeObj = {
        "GT":{
            "rooms_seats": parseInt(roomSize)
        }
    }

    var roomtypeObj = {
        "IS":{
            "rooms_type": roomType
        }
    }

    var furnitureObj = {
        "IS":{
            "rooms_furniture": furnitureType
        }
    }


    if (argArr.length == 1){
        if ( buildingName != ""){
            query.WHERE = nameObj
        }

        if(buildingNum != ""){
            query.WHERE = numObj
        }

        if(roomSize != ""){
            query.WHERE = sizeObj
        }

        if(roomType != ""){
            query.WHERE = roomtypeObj
        }

        if(furnitureType != ""){
            query.WHERE = furnitureObj
        }
    }
    else {
        filterArr = [];

        if ( buildingName != ""){
            filterArr.push(nameObj);
        }

        if(buildingNum != ""){
            filterArr.push(numObj);
        }

        if(roomSize != ""){
            filterArr.push(sizeObj);
        }

        if(roomType != ""){
            filterArr.push(roomtypeObj);
        }

        if(furnitureType != ""){
            filterArr.push(furnitureObj);
        }
        query.WHERE = new Object;
        if(extraFilter == "AND"){
            query.WHERE.AND = filterArr
        }
        else{
            query.WHERE.OR = filterArr
        }
    }

    query.OPTIONS = new Object();

    if( column == ""){
        query.OPTIONS.COLUMNS  = ["rooms_fullname","rooms_shortname", "rooms_number","rooms_name","rooms_address", "rooms_lat", "rooms_lon", "rooms_seats","rooms_type","rooms_furniture","rooms_href" ];
    }
    else if(column.includes(",")){
        query.OPTIONS.COLUMNS = column.split(",")
    }
    else{
        query.OPTIONS.COLUMNS = [column]
    }

    query.OPTIONS.FORM = "TABLE";

    if(order != ""){
        if(order.includes(',')){
            query.OPTIONS.ORDER = {
                dir: orderSort,
                keys: order.split(',')
            }
        }
        else {
            query.OPTIONS.ORDER = {
                dir: orderSort,
                keys: [order]
            }
        }
    }


    if(group != ""){
        query.TRANSFORMATIONS = new Object;
        query.TRANSFORMATIONS.GROUP = [group];
        query.TRANSFORMATIONS.APPLY = [];
    }
    console.log(query);
   return query;
}

$("#btnUpload").click(function(){
    var fileToLoad = document.getElementById("fileUpload").files[0];    //get element by id
    var fileReader = new FileReader();                                  //read into content of file
    fileReader.readAsArrayBuffer(fileToLoad);
    fileReader.onload = function (evt) {
        var id = fileToLoad.name.split('.')[0];
        var content = evt.target.result;
        var formData = new FormData();
        formData.append('body', new Blob ([content]));

        $.ajax({
            url: 'http://localhost:4321/dataset/' +id,
            type: 'put',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
        }).done(function(data){
            console.log(fileToLoad.name + ' was sucessfully uploaded.');
            console.log(data);
        }).fail(function (data) {
            console.log('ERROR - Failed to upload '+ fileToLoad.name + ".");
        })
    }
});

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

function generateTable(data){
    var tbl_body = document.createElement("tbody");
    var odd_even = false;
    console.log("DATA", data);
    $.each(data,function(){
        var tbl_row = tbl_body.insertRow();
        tbl_row.className = odd_even ? "odd" : "even";
        $.each(this, function (k,v){
            var cell = tbl_row.insertCell();
            cell.appendChild(document.createTextNode(v.toString()))
        })
        odd_even = !odd_even;
    })
    document.getElementById("tbl_result").appendChild(tbl_body)
}
