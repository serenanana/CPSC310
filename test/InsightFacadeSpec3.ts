/**
 * Created by Ian on 2017-02-19.
 */
//ust to commit
import {expect} from 'chai';
import {InsightResponse} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import {App} from "../src/App";

var chai = require('chai')
//    , chaiHttp = require('chai-http');
//chai.use(chaiHttp);

describe('InsightFacadeSpec3', function() {

    var fs = require("fs");
    var IF = new InsightFacade();
    var app = new App();
    before(function() {
        app.initServer;
    });

    it('add Room dataSet successful', function(done) {

        fs.readFile("./rooms.zip", function (err: any, data: any) {
            if (err)
                throw err;
            IF.addDataset("rooms",data.toString("base64")).then(function (data:InsightResponse){
                console.log(data.code);
                //console.log(data.body);
                done();
            })
                .catch(function(err){
                        expect.fail();
                    }
                );
        })
    });

    it('add Course dataSet successful', function(done) {

        fs.readFile("./courses.zip", function (err: any, data: any) {
            if (err)
                throw err;
            IF.addDataset("courses",data.toString("base64")).then(function (data:InsightResponse){
                console.log(data.code);
                //console.log(data.body);
                done();
            })
                .catch(function(err){
                        expect.fail();
                    }
                );
        })
    });

    it('Query A', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            expect(JSON.stringify(data.body)).to.equal(
                JSON.stringify({
                    "render": "TABLE",
                    "result": [
                        {
                            "rooms_shortname": "OSBO",
                            "maxSeats": 442
                        },
                        {
                            "rooms_shortname": "HEBB",
                            "maxSeats": 375
                        },
                        {
                            "rooms_shortname": "LSC",
                            "maxSeats": 350
                        }
                    ]
                }));
            done();
        }).catch(function (err: InsightResponse) {
            console.log("QueryA");
            console.log(err);
            expect.fail();
            done();
        })
    })

    it('Query B', function (done) {
        IF.performQuery({
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            expect(JSON.stringify(data.body)).to.equal(
                JSON.stringify({
                    "render": "TABLE",
                    "result": [{
                        "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tablets"
                    }, {
                        "rooms_furniture": "Classroom-Hybrid Furniture"
                    }, {
                        "rooms_furniture": "Classroom-Learn Lab"
                    }, {
                        "rooms_furniture": "Classroom-Movable Tables & Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Movable Tablets"
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tables & Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tablets"
                    }]
                }));
            done();
        }).catch(function (err: InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Sahara: Apply: AVG should be supported', function (done) {
        IF.performQuery({
            "WHERE": {
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "avgSeats"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["avgSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "avgSeats": {
                        "AVG": "rooms_seats"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            expect(JSON.stringify(data.body)).to.equal(
                JSON.stringify({"render":"TABLE","result":[{"rooms_shortname":"SOWK","avgSeats":14.67},{"rooms_shortname":"MCML","avgSeats":17.59},{"rooms_shortname":"AUDX","avgSeats":20.5},{"rooms_shortname":"SPPH","avgSeats":27.67},{"rooms_shortname":"FNH","avgSeats":28},{"rooms_shortname":"ORCH","avgSeats":29.22},{"rooms_shortname":"PCOH","avgSeats":30.86},{"rooms_shortname":"IBLC","avgSeats":31.65},{"rooms_shortname":"HENN","avgSeats":32},{"rooms_shortname":"ANSO","avgSeats":32},{"rooms_shortname":"FSC","avgSeats":34},{"rooms_shortname":"SCRF","avgSeats":34.48},{"rooms_shortname":"BIOL","avgSeats":36},{"rooms_shortname":"LASR","avgSeats":40},{"rooms_shortname":"BUCH","avgSeats":43.32},{"rooms_shortname":"UCLL","avgSeats":44.33},{"rooms_shortname":"WOOD","avgSeats":45.54},{"rooms_shortname":"ALRD","avgSeats":45.6},{"rooms_shortname":"BRKX","avgSeats":47},{"rooms_shortname":"FORW","avgSeats":47.33},{"rooms_shortname":"CEME","avgSeats":48.17},{"rooms_shortname":"PHRM","avgSeats":48.91},{"rooms_shortname":"EOSM","avgSeats":50},{"rooms_shortname":"MATH","avgSeats":52},{"rooms_shortname":"ANGU","avgSeats":55.21},{"rooms_shortname":"GEOG","avgSeats":56.29},{"rooms_shortname":"SWNG","avgSeats":64.59},{"rooms_shortname":"IONA","avgSeats":75},{"rooms_shortname":"ESB","avgSeats":80},{"rooms_shortname":"MCLD","avgSeats":83.83},{"rooms_shortname":"DMP","avgSeats":88},{"rooms_shortname":"CHBE","avgSeats":118},{"rooms_shortname":"LSK","avgSeats":126.25},{"rooms_shortname":"HEBB","avgSeats":134.25},{"rooms_shortname":"FRDM","avgSeats":160},{"rooms_shortname":"OSBO","avgSeats":241},{"rooms_shortname":"LSC","avgSeats":275},{"rooms_shortname":"SRC","avgSeats":299}]}));
            done();
        }).catch(function (err: InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Sacrilicious: Apply: SUM should be supported', function (done) {
        IF.performQuery({
            "WHERE": {
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "sumSeats"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["sumSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "sumSeats": {
                        "SUM": "rooms_seats"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(JSON.stringify(data.body));
            expect(JSON.stringify(data.body)).to.equal(
                JSON.stringify({"render":"TABLE","result":[{"rooms_shortname":"FNH","sumSeats":28},{"rooms_shortname":"AUDX","sumSeats":41},{"rooms_shortname":"SOWK","sumSeats":44},{"rooms_shortname":"EOSM","sumSeats":50},{"rooms_shortname":"ESB","sumSeats":80},{"rooms_shortname":"BRKX","sumSeats":94},{"rooms_shortname":"HENN","sumSeats":96},{"rooms_shortname":"ANSO","sumSeats":96},{"rooms_shortname":"BIOL","sumSeats":108},{"rooms_shortname":"LASR","sumSeats":120},{"rooms_shortname":"UCLL","sumSeats":133},{"rooms_shortname":"FORW","sumSeats":142},{"rooms_shortname":"IONA","sumSeats":150},{"rooms_shortname":"MATH","sumSeats":156},{"rooms_shortname":"FRDM","sumSeats":160},{"rooms_shortname":"SPPH","sumSeats":166},{"rooms_shortname":"PCOH","sumSeats":216},{"rooms_shortname":"ALRD","sumSeats":228},{"rooms_shortname":"ORCH","sumSeats":263},{"rooms_shortname":"FSC","sumSeats":272},{"rooms_shortname":"CEME","sumSeats":289},{"rooms_shortname":"MCML","sumSeats":299},{"rooms_shortname":"CHBE","sumSeats":354},{"rooms_shortname":"GEOG","sumSeats":394},{"rooms_shortname":"DMP","sumSeats":440},{"rooms_shortname":"OSBO","sumSeats":482},{"rooms_shortname":"MCLD","sumSeats":503},{"rooms_shortname":"LSK","sumSeats":505},{"rooms_shortname":"HEBB","sumSeats":537},{"rooms_shortname":"IBLC","sumSeats":538},{"rooms_shortname":"PHRM","sumSeats":538},{"rooms_shortname":"WOOD","sumSeats":592},{"rooms_shortname":"SCRF","sumSeats":724},{"rooms_shortname":"LSC","sumSeats":825},{"rooms_shortname":"SRC","sumSeats":897},{"rooms_shortname":"SWNG","sumSeats":1421},{"rooms_shortname":"BUCH","sumSeats":1473},{"rooms_shortname":"ANGU","sumSeats":1546}]}))
            done();
        }).catch(function (err: InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Sagittarius: Apply: COUNT should be supported', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "countSeats"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["countSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "countSeats": {
                        "COUNT": "rooms_seats"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(JSON.stringify(data.body));
            expect(JSON.stringify(data.body)).to.equal(
                JSON.stringify({"render":"TABLE","result":[{"rooms_shortname":"EOSM","countSeats":1},{"rooms_shortname":"ESB","countSeats":1},{"rooms_shortname":"FRDM","countSeats":1},{"rooms_shortname":"SRC","countSeats":1},{"rooms_shortname":"FNH","countSeats":1},{"rooms_shortname":"HEBB","countSeats":2},{"rooms_shortname":"OSBO","countSeats":2},{"rooms_shortname":"AUDX","countSeats":2},{"rooms_shortname":"PCOH","countSeats":2},{"rooms_shortname":"MATH","countSeats":2},{"rooms_shortname":"BIOL","countSeats":2},{"rooms_shortname":"SOWK","countSeats":2},{"rooms_shortname":"IONA","countSeats":2},{"rooms_shortname":"HENN","countSeats":2},{"rooms_shortname":"LSC","countSeats":2},{"rooms_shortname":"BRKX","countSeats":2},{"rooms_shortname":"LASR","countSeats":2},{"rooms_shortname":"FORW","countSeats":3},{"rooms_shortname":"UCLL","countSeats":3},{"rooms_shortname":"CHBE","countSeats":3},{"rooms_shortname":"ORCH","countSeats":3},{"rooms_shortname":"ANSO","countSeats":3},{"rooms_shortname":"DMP","countSeats":4},{"rooms_shortname":"ALRD","countSeats":4},{"rooms_shortname":"LSK","countSeats":4},{"rooms_shortname":"PHRM","countSeats":5},{"rooms_shortname":"FSC","countSeats":5},{"rooms_shortname":"SWNG","countSeats":5},{"rooms_shortname":"MCLD","countSeats":5},{"rooms_shortname":"MCML","countSeats":6},{"rooms_shortname":"SCRF","countSeats":6},{"rooms_shortname":"GEOG","countSeats":6},{"rooms_shortname":"SPPH","countSeats":6},{"rooms_shortname":"CEME","countSeats":6},{"rooms_shortname":"WOOD","countSeats":7},{"rooms_shortname":"IBLC","countSeats":9},{"rooms_shortname":"BUCH","countSeats":12},{"rooms_shortname":"ANGU","countSeats":15}]}))
            done();
        }).catch(function (err: InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Quicksilver: Should be able to get all courses data', function (done) {
        IF.performQuery({
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept","courses_id","courses_avg","courses_instructor","courses_title","courses_pass","courses_fail","courses_audit","courses_uuid","courses_year","countAudits"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_uuid"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept","courses_id","courses_avg","courses_instructor","courses_title","courses_pass","courses_fail","courses_audit","courses_uuid","courses_year"],
                "APPLY": [{
                    "countAudits": {
                        "COUNT": "courses_audit"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            done();
        }).catch(function (err: InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Snacktacular: Empty APPLY should be valid and supported.', function (done) {
        IF.performQuery({
            "WHERE": {
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept"],
                "APPLY": []
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            expect(JSON.stringify(data.body)).to.equal(
                JSON.stringify({"render":"TABLE","result":[{"courses_dept":"aanb"},{"courses_dept":"adhe"},{"courses_dept":"anat"},{"courses_dept":"anth"},{"courses_dept":"apbi"},{"courses_dept":"appp"},{"courses_dept":"apsc"},{"courses_dept":"arbc"},{"courses_dept":"arch"},{"courses_dept":"arcl"},{"courses_dept":"arst"},{"courses_dept":"arth"},{"courses_dept":"asia"},{"courses_dept":"asic"},{"courses_dept":"astr"},{"courses_dept":"astu"},{"courses_dept":"atsc"},{"courses_dept":"audi"},{"courses_dept":"ba"},{"courses_dept":"baac"},{"courses_dept":"babs"},{"courses_dept":"baen"},{"courses_dept":"bafi"},{"courses_dept":"bahr"},{"courses_dept":"bait"},{"courses_dept":"bala"},{"courses_dept":"bama"},{"courses_dept":"bams"},{"courses_dept":"bapa"},{"courses_dept":"basc"},{"courses_dept":"basm"},{"courses_dept":"baul"},{"courses_dept":"bioc"},{"courses_dept":"biof"},{"courses_dept":"biol"},{"courses_dept":"bmeg"},{"courses_dept":"bota"},{"courses_dept":"busi"},{"courses_dept":"caps"},{"courses_dept":"ccst"},{"courses_dept":"ceen"},{"courses_dept":"cell"},{"courses_dept":"cens"},{"courses_dept":"chbe"},{"courses_dept":"chem"},{"courses_dept":"chil"},{"courses_dept":"chin"},{"courses_dept":"cics"},{"courses_dept":"civl"},{"courses_dept":"clch"},{"courses_dept":"clst"},{"courses_dept":"cnps"},{"courses_dept":"cnrs"},{"courses_dept":"cnto"},{"courses_dept":"coec"},{"courses_dept":"cogs"},{"courses_dept":"cohr"},{"courses_dept":"comm"},{"courses_dept":"cons"},{"courses_dept":"cpen"},{"courses_dept":"cpsc"},{"courses_dept":"crwr"},{"courses_dept":"dani"},{"courses_dept":"dent"},{"courses_dept":"dhyg"},{"courses_dept":"eced"},{"courses_dept":"econ"},{"courses_dept":"edcp"},{"courses_dept":"edst"},{"courses_dept":"educ"},{"courses_dept":"eece"},{"courses_dept":"elec"},{"courses_dept":"ends"},{"courses_dept":"engl"},{"courses_dept":"enph"},{"courses_dept":"envr"},{"courses_dept":"eosc"},{"courses_dept":"epse"},{"courses_dept":"etec"},{"courses_dept":"fhis"},{"courses_dept":"fipr"},{"courses_dept":"fish"},{"courses_dept":"fist"},{"courses_dept":"fmst"},{"courses_dept":"fnel"},{"courses_dept":"fnh"},{"courses_dept":"fnis"},{"courses_dept":"food"},{"courses_dept":"fopr"},{"courses_dept":"fre"},{"courses_dept":"fren"},{"courses_dept":"frst"},{"courses_dept":"gbpr"},{"courses_dept":"geob"},{"courses_dept":"geog"},{"courses_dept":"germ"},{"courses_dept":"gpp"},{"courses_dept":"grek"},{"courses_dept":"grsj"},{"courses_dept":"gsat"},{"courses_dept":"hebr"},{"courses_dept":"hgse"},{"courses_dept":"hinu"},{"courses_dept":"hist"},{"courses_dept":"hunu"},{"courses_dept":"iar"},{"courses_dept":"igen"},{"courses_dept":"info"},{"courses_dept":"isci"},{"courses_dept":"ital"},{"courses_dept":"itst"},{"courses_dept":"iwme"},{"courses_dept":"japn"},{"courses_dept":"jrnl"},{"courses_dept":"kin"},{"courses_dept":"korn"},{"courses_dept":"lais"},{"courses_dept":"larc"},{"courses_dept":"laso"},{"courses_dept":"last"},{"courses_dept":"latn"},{"courses_dept":"law"},{"courses_dept":"lfs"},{"courses_dept":"libe"},{"courses_dept":"libr"},{"courses_dept":"ling"},{"courses_dept":"lled"},{"courses_dept":"math"},{"courses_dept":"mdvl"},{"courses_dept":"mech"},{"courses_dept":"medg"},{"courses_dept":"medi"},{"courses_dept":"micb"},{"courses_dept":"midw"},{"courses_dept":"mine"},{"courses_dept":"mrne"},{"courses_dept":"mtrl"},{"courses_dept":"musc"},{"courses_dept":"name"},{"courses_dept":"nest"},{"courses_dept":"nrsc"},{"courses_dept":"nurs"},{"courses_dept":"obst"},{"courses_dept":"onco"},{"courses_dept":"path"},{"courses_dept":"pcth"},{"courses_dept":"pers"},{"courses_dept":"phar"},{"courses_dept":"phil"},{"courses_dept":"phrm"},{"courses_dept":"phth"},{"courses_dept":"phys"},{"courses_dept":"plan"},{"courses_dept":"poli"},{"courses_dept":"pols"},{"courses_dept":"port"},{"courses_dept":"psyc"},{"courses_dept":"punj"},{"courses_dept":"relg"},{"courses_dept":"rgla"},{"courses_dept":"rhsc"},{"courses_dept":"rmes"},{"courses_dept":"rmst"},{"courses_dept":"rsot"},{"courses_dept":"russ"},{"courses_dept":"sans"},{"courses_dept":"scan"},{"courses_dept":"scie"},{"courses_dept":"soci"},{"courses_dept":"soil"},{"courses_dept":"sowk"},{"courses_dept":"span"},{"courses_dept":"spha"},{"courses_dept":"spph"},{"courses_dept":"stat"},{"courses_dept":"sts"},{"courses_dept":"surg"},{"courses_dept":"swed"},{"courses_dept":"test"},{"courses_dept":"thtr"},{"courses_dept":"udes"},{"courses_dept":"ufor"},{"courses_dept":"urst"},{"courses_dept":"ursy"},{"courses_dept":"vant"},{"courses_dept":"visa"},{"courses_dept":"wood"},{"courses_dept":"wrds"},{"courses_dept":"zool"}]}));
            done();
        }).catch(function (err: InsightResponse) {
            console.log("QueryA");
            console.log(err);
            expect.fail();
            done();
        })
    })

    it('Stringer: Should be able to query with many APPLY keys and sort over them.', function (done) {
        IF.performQuery(
            {
                "WHERE": {
                    "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }, {
                        "GT": {
                            "rooms_seats": 300
                        }
                    }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_shortname", "maxSeats", "minSeats", "avgSeats", "sumSeats", "countSeats"
                    ],
                    "ORDER": {
                        "dir": "DOWN",
                        "keys": ["maxSeats","countSeats"]
                    },
                    "FORM": "TABLE"
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["rooms_shortname"],
                    "APPLY": [
                        {"maxSeats": {"MAX": "rooms_seats"}},
                        {"minSeats": {"MIN": "rooms_seats"}},
                        {"avgSeats": {"AVG": "rooms_seats"}},
                        {"sumSeats": {"SUM": "rooms_seats"}},
                        {"countSeats": {"COUNT": "rooms_seats"}}]
                }
            }
        ).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            expect(JSON.stringify(data.body)).to.equal(
                JSON.stringify({"render":"TABLE","result":[{"rooms_shortname":"OSBO","maxSeats":442,"minSeats":442,"avgSeats":442,"sumSeats":442,"countSeats":1},{"rooms_shortname":"HEBB","maxSeats":375,"minSeats":375,"avgSeats":375,"sumSeats":375,"countSeats":1},{"rooms_shortname":"LSC","maxSeats":350,"minSeats":350,"avgSeats":350,"sumSeats":700,"countSeats":1}]}));
            done();
        }).catch(function (err: InsightResponse) {
            console.log("QueryA");
            console.log(err);
            expect.fail();
            done();
        })
    })

    it('Max should only support numerical values', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_type"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            //console.log(err.code);
            expect(err.code).to.equal(400);
            console.log(err.body);
            //expect(err.body).to.equal({"error":"Max supports only numerical values"});
            done();
        })
    })

    it('Min should only support numerical values', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MIN": "rooms_type"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            //expect(err.body).to.equal({"error":"Min supports only numerical values"});
            done();
        })
    })

    it('AVG should only support numerical values', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "AVG": "rooms_type"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            //expect(err.body).to.equal({"error":"Avg supports only numerical values"});
            done();
        })
    })

    it('SUM should only support numerical values', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "SUM": "rooms_type"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            //expect(err.body).to.equal({"error":"Sum supports only numerical values"});
            done();
        })
    })

    it('COUNT supports both string and numbers', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "countSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["countSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "countSeats": {
                        "COUNT": "rooms_type"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(JSON.stringify(data.body));
            expect(JSON.stringify(data.body)).to.equal(JSON.stringify({"render":"TABLE","result":[{"rooms_shortname":"WOOD","countSeats":1},{"rooms_shortname":"HEBB","countSeats":1},{"rooms_shortname":"WESB","countSeats":1},{"rooms_shortname":"OSBO","countSeats":1},{"rooms_shortname":"LSC","countSeats":1},{"rooms_shortname":"ESB","countSeats":1},{"rooms_shortname":"CIRS","countSeats":1}]}));
            done();
        }).catch(function (err: InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('apply cannot contain _', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "count_Seats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["count_Seats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "count_Seats": {
                        "COUNT": "rooms_type"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            done();
        })
    })

    it('Group without apply should throw 400', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "count_Seats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["count_Seats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            done();
        })
    })

    it('Apply without group should throw 400', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "count_Seats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["count_Seats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "APPLY": [{
                    "count_Seats": {
                        "COUNT": "rooms_type"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            done();
        })
    })

    it('New order must be from apply or Column', function (done) {
        IF.performQuery({
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["asdf"]
                },
                "FORM":"TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept","courses_avg"],
                "APPLY": [{
                    "max_avg": {
                        "MAX": "courses_avg"
                    }
                }]
            }
        }).then(function (data:InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            done();
        })
    })

    it('Snacktacular: Empty APPLY should be valid and supported.', function (done) {
        IF.performQuery({
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept","courses_avg"],
                "APPLY": []
            }
        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
            done();
        })
    })
    it('Tomacco: Should be able to perform a valid query, even if it makes no sense', function (done) {
        IF.performQuery({
            "WHERE":{
                        "EQ": {
                            "courses_avg": 95
                        }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept", "maxAvg", "minAvg", "avgAvg", "sumAvg", "countAvg"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxAvg","countAvg"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept","courses_uuid"],
                "APPLY": [
                    {"maxAvg": {"MAX": "courses_avg"}},
                    {"minAvg": {"MIN": "courses_avg"}},
                    {"avgAvg": {"AVG": "courses_avg"}},
                    {"sumAvg": {"SUM": "courses_avg"}},
                    {"countAvg": {"COUNT": "courses_avg"}}]
            }
        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Apply is malformed', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    },
                    "countSeats": {
                        "COUNT": "rooms_seats"
                    }
                }]
            }
        }).then(function (data:InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400);
            //should return 400, Apply for mat is wrong
            console.log(err.body);
            done();
        })
    })

    it('No order', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [
                    {"maxSeats": {"MAX": "rooms_seats"}},
                    {"countSeats": {"COUNT": "rooms_seats"}}
                ]
            }
        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Multiple Groupkey', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 50
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_seats",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_seats"],
                "APPLY": [
                    {"maxSeats": {"MAX": "rooms_seats"}}
                ]
            }
        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Multiple Groupkey and apply keys', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 50
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_seats",
                    "maxSeats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_seats"],
                "APPLY": [
                    {"maxSeats": {"MAX": "rooms_seats"}},
                    {"countSeats": {"COUNT": "rooms_seats"}}
                ]
            }
        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
            done();
        })
    })

    it('Group cannot contain apply keys', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","maxSeats"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            //console.log(err.code);
            expect(err.code).to.equal(400);
            console.log(err.body);
            //expect(err.body).to.equal({"error":"Max supports only numerical values"});
            done();
        })
    })

    it('This query should pass', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err: InsightResponse) {
            //console.log(err.code);
            expect.fail();
            //expect(err.body).to.equal({"error":"Max supports only numerical values"});
            done();
        })
    })

    it('Invalid Apply keys', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 300
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seat"
                    }
                }]
            }
        }).then(function (data: InsightResponse) {
            expect.fail();
            done();
        }).catch(function (err: InsightResponse) {
            //console.log(err.code);
            expect(err.code).to.equal(400);
            console.log(err.body);
            //expect(err.body).to.equal({"error":"Max supports only numerical values"});
            done();
        })
    })


    it('remove rooms dataSet successful', function(done) {

        IF.removeDataset("rooms")
            .then(function (data:InsightResponse) {
                console.log(data.body);
                done();
            }).catch(function (err:InsightResponse) {
            console.log(err.body);
            done();
        })
    });

    it('remove courses dataSet successful', function(done) {

        IF.removeDataset("courses")
            .then(function (data:InsightResponse) {
                console.log(data.body);
                done();
            }).catch(function (err:InsightResponse) {
            console.log(err.body);
            done();
        })
    });
});