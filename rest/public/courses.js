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
    var instructor = $("#instructor").val();
    var order = $("#order").val();
    var orderSort = $("#orderSort").val();
    var column = $("#column").val();
    var section = $("#section").val();
    var department =$("#department").val();
    var coursenum = $("#coursenum").val();
    var title = $("#title").val();
    var group = $("#group").val();
    var extraFilter = $("#extraFilter").val();
    var argArr = [];
    var wherearray = [instructor,section,department,coursenum,title];

    wherearray.forEach(function (ele){
        if (ele != ""){
            argArr.push(ele);
        }
    })

    var query = new Object();
    var sectionObj = {
        "EQ":{
            "courses_size": parseInt(section)
        }
    }
    var instructorObj = {
        "IS":{
            "courses_instructor": "*"+instructor+"*"
        }
    }
    var departmentObj = {
        "IS":{
            "courses_dept": department
        }
    }

    var idObj = {
        "IS":{
            "courses_id": coursenum
        }
    }

    var titleObj = {
        "IS":{
            "courses_title": title
        }
    }

    if (argArr.length == 1){
        if ( section != ""){
            query.WHERE = sectionObj
        }

        if(instructor != ""){
            query.WHERE = instructorObj
        }

        if(department != ""){
            query.WHERE = departmentObj
        }

        if(coursenum != ""){
            query.WHERE = idObj
        }

        if(title != ""){
            query.WHERE = titleObj
        }
    }
    else {
        filterArr = [];

        if ( section != ""){
            filterArr.push(sectionObj);
        }

        if(instructor != ""){
            filterArr.push(instructorObj);
        }

        if(department != ""){
            filterArr.push(departmentObj);
        }

        if(coursenum != ""){
            filterArr.push(idObj);
        }

        if(title != ""){
            filterArr.push(titleObj);
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
        query.OPTIONS.COLUMNS  = ["courses_dept","courses_id","courses_avg","courses_instructor","courses_title","courses_pass","courses_fail","courses_audit","courses_uuid","courses_year","courses_size"];
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
