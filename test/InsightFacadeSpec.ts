import {expect} from 'chai';
import {InsightResponse} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";

describe('InsightFacadeSpec', function() {

    var fs = require ("fs");
    var IF = new InsightFacade();

    it('remove dataSet successful', function(done) {

            IF.removeDataset("courses")
                .then(function (data:InsightResponse) {
                    console.log(data.body);
                    done();
                }).catch(function (err:InsightResponse) {
                console.log(err.body);
                done();
            })
    });

    it('424', function (done) {
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
            }
        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(424);
            console.log(err.body);
            done();
        })
    })

    it('add dataSet successful', function(done) {

        fs.readFile("./courses.zip", function (err: any, data: any) {
            if (err)
                throw err;
            IF.addDataset("courses",data.toString("base64")).then(function (data:InsightResponse){
                console.log(data.code);
                console.log(data.body);
                done();
            })
                .catch(function(err:any){
                    console.log(1111);
                    console.log(err);
                    expect.fail();
                    }
                );
        })
    });

/*
    it('Perfrom query', function (done) {
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
*/
    it('Perfrom query', function (done) {
        IF.performQuery({
            "WHERE":{
                "AND":[
                    {
                        "IS": {
                            "courses_dept": "cpsc"
                        }
                    },
                    {
                        "IS": {
                            "courses_id": "310"
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_pass",
                    "courses_fail",
                    "courses_year",
                    "courses_id"
                ],
                "ORDER":"courses_year",
                "FORM":"TABLE"
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
/*
    it('Perfrom query', function (done) {
        IF.performQuery({
            "WHERE":{
                "OR":[
                    {
                        "AND":[
                            {
                                "GT":{
                                    "courses_avg":90
                                }
                            },
                            {
                                "IS":{
                                    "courses_dept":"adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ":{
                            "courses_avg":95
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
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

    it('BigFish: Should not be able to set a dataset that is not a zip file.', function(done) {

        fs.readFile("./README.md", function (err: any, data: any) {
            if (err)
                throw err;
            IF.addDataset("courses",data.toString("base64")).then(function (data:InsightResponse){
                console.log(err.body);
                done();
            })
                .catch(function(err){
                        expect(err.code).to.equal(400);
                        console.log(err.body);
                        done();
                    }
                );
        })
    });

    it('Bender: Should not be able to set a valid zip that does not contain any real data..', function(done) {

        fs.readFile("./fakedata.zip", function (err: any, data: any) {
            if (err)
                throw err;
            IF.addDataset("courses",data.toString("base64")).then(function (data:InsightResponse){
                console.log(err.body);
                done();
            })
                .catch(function(err){
                        expect(err.code).to.equal(400);
                        console.log(err.body);
                        done();
                    }
                );
        })
    });

     xit('Add duplicate correct dataset', function(done) {

         fs.readFile("./courses.zip", function (err: any, data: any) {
             if (err)
                 throw err;
             IF.addDataset("courses",data.toString("base64")).then(function (data:InsightResponse){
                 expect(data.code).to.equal(201);

                 expect(data.body.valueOf()).to.equal("the operation was successful and the id was new");
                 done();
             })
                 .catch(function(err){
                         expect(err.code).to.equal(400);
                         expect.fail();
                         done();
                     }
                 );
         })
     });

    it('remove fake dataset', function(done) {

        IF.removeDataset("cat")
            .then(function (data:InsightResponse) {
                expect.fail();
            }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(404);
            console.log(err.body);
            done();

        })
    });

      //PERFORM QUERY TESTS

    it('Apollo: Should be able to find all sections for a dept.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_dept":"adhe"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_dept",
                    "courses_avg"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Astro: Should be able to find sections taught by a specific person.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_instructor":"palacios, carolina"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_id",
                    "courses_title"
                ],
                ORDER:"courses_id",
                FORM:"TABLE"
            }
        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

     xit('Aurora: performQuery 424.', function (done) {
         IF.performQuery({
             WHERE:{
                 "IS":{
                     "courses_instructor":"adhe"
                 }
             },
             OPTIONS:{
                 COLUMNS:[
                     "courses_id",
                     "courses_title"
                 ],
                 ORDER:"courses_id",
                 FORM:"TABLE"
             }

         }).then(function (data:InsightResponse) {
             expect(data.code).to.equal(424)

             done();
         }).catch(function (err:InsightResponse) {
             expect.fail();
         })
     })

    it('Bongo: Should be able to find sections with lots of auditors.', function (done) {
        IF.performQuery({
            WHERE:{
                "GT":{
                    "courses_audit": 10
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_audit",
                    "courses_id",
                    "courses_title"
                ],
                ORDER:"courses_audit",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Colusa: Should be able to find sections with high averages.', function (done) {
        IF.performQuery({
            WHERE:{
                "GT":{
                    "courses_avg":95
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_pass",
                    "courses_title",
                    "courses_avg"
                ],
                ORDER:"courses_pass",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Camelot: Should be able to find course average for a course.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_title":"teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_instructor"
                ],
                ORDER:"courses_instructor",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Darwin: Should be able to find course title for courses in a dept.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_dept":"aanb"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_id",
                    "courses_title",
                ],
                ORDER:"courses_title",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Deepmind: Should be able to find sections in a dept with average between 70 and 80.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "GT":{
                            "courses_avg":80
                        }
                    },
                    {
                        "LT":{
                            "courses_avg":90
                        }
                    },
                    {
                        "IS": {
                            "courses_dept": "psyc"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_dept",
                    "courses_uuid",
                    "courses_title"
                ],
                ORDER:"courses_uuid",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Elixir: Should be able to find sections with an or query on different keys.', function (done) {
        IF.performQuery({
            WHERE:{
                "OR":[
                    {
                        "GT":{
                            "courses_fail":20
                        }
                    },
                    {
                        "IS":{
                            "courses_dept":"aanb"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_fail",
                    "courses_dept",
                    "courses_title"
                ],
                ORDER:"courses_fail",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Excalibur: Should be able to find all sections of specific courses from different departments.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_title": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)

            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Fester: Should be able to find all instructors with the same partial name.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_instructor": "*gregor*"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_instructor",
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Fireball: Should be able to find all courses in a dept with a partial name.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "IS":{
                            "courses_instructor":""
                        }
                    },
                    {
                        "IS":{
                            "courses_dept":"*ad*"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_id",
                    "courses_title",
                    "courses_instructor"
                ],
                ORDER:"courses_id",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Firestorm: Should be able to find all sections in a dept not taught by a specific person.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "NOT":{
                            "IS":{
                                "courses_instructor":""
                            }
                        }
                    },
                    {
                        "IS":{
                            "courses_dept":"adhe"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_instructor",
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Firetruck: Should be able to find all courses in a dept except some specific examples.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "NOT":{
                            "IS":{
                                "courses_id": "110"
                            }
                        }
                    },
                    {
                        "IS":{
                            "courses_dept":"cpsc"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_id",
                    "courses_title"
                ],
                ORDER:"courses_id",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Fusion: Should be able to find all courses in multiple deptartments with a set of instructors.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "OR":[
                            {
                                "IS":{
                                    "courses_dept":"aanb"
                                }
                            },
                            {
                                "IS":{
                                    "courses_dept":"cpsc"
                                }
                            }
                        ]
                    },
                    {
                        "OR":[
                            {
                                "IS":{
                                    "courses_instructor": ""
                                }
                            },
                            {
                                "IS":{
                                    "courses_instructor":"kiczales, gregor"
                                }
                            }
                        ]
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_dept",
                    "courses_instructor"
                ],
                ORDER:"courses_dept",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Galactica: Handle complex AND queries.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "OR":[
                            {
                                "IS":{
                                    "courses_dept":"aanb"
                                }
                            },
                            {
                                "IS":{
                                    "courses_dept":"cpsc"
                                }
                            }
                        ]
                    },
                    {
                        "AND":[
                            {
                                "IS":{
                                    "courses_instructor": ""
                                }
                            },
                            {
                                "GT":{
                                    "courses_avg":80
                                }
                            }
                        ]
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Gemini: Handle complex OR queries.', function (done) {
        IF.performQuery({
            WHERE:{
                "OR":[
                    {
                        "GT":{
                            "courses_avg":90
                        }
                    },
                    {
                        "IS":{
                            "courses_dept":"adhe"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Glavin: Check that non-integer numbers work.', function (done) {
        IF.performQuery({
            WHERE:{
                "EQ":{
                    "courses_avg": 85.64
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)
            console.log(data.body);
            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Hades: Check EQ.', function (done) {
        IF.performQuery({
            WHERE:{
                "EQ":{
                    "courses_avg": 0
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)

            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Honeycomb: Empty columns result in invalid query 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_title": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Hydra: Missing FORM results in invalid query with 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_title": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Indigo: Handle double negation.', function (done) {
        IF.performQuery({
            WHERE:{
                "NOT":{
                    "NOT": {
                        "IS":{
                            "courses_title": "teach adult"
                        }
                    }
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)

            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Irongate: Check GT on number field.', function (done) {
        IF.performQuery({
            WHERE:{
                "GT":{
                    "courses_avg": 92.5
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)

            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Ivory: Check math operations with OR.', function (done) {
        IF.performQuery({
            WHERE:{
                "OR":[
                    {
                        "GT":{
                            "courses_avg":90
                        }
                    },
                    {
                        "LT":{
                            "courses_avg":70
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)

            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Jade: Complex query with AND, EQ, and GT.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "GT":{
                            "courses_avg":90
                        }
                    },
                    {
                        "EQ":{
                            "courses_id":327
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200)

            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    it('Jaguar: Invalid query should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{

            },
            OPTIONS:{
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Jiro: Invalid ORDER should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_title": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"123",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Jonah: Invalid FORM should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_title": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"as"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

     it('Kanga: Invalid key should result in 400.', function (done) {
         IF.performQuery({
             WHERE:{
                 "IS":{
                     "courses": "teach adult"
                 }
             },
             OPTIONS:{
                 COLUMNS:[
                     "courses_avg",
                     "courses_title"
                 ],
                 ORDER:"courses_avg",
                 FORM:"TABLE"
             }

         }).then(function (data:InsightResponse) {
             expect.fail();
         }).catch(function (err:InsightResponse) {
             expect(err.code).to.equal(400)
             console.log(err.body);
             done();
         })
     })

    it('Kodiak: Invalid nested key should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[{
                    "IS":{
                        "courses_title": "teach adult"
                    }
                }]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Kryptonite: Invalid EQ should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "EQ":{
                    "courses_title": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Kwyjibo: Invalid LT should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "LT":{
                    "courses_title": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Laguna: Invalid GT should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "GT":{
                    "courses_avg": "teach adult"
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400)
            console.log(err.body);
            done();
        })
    })

    it('Liberation: Invalid IS should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "IS":{
                    "courses_title": 123
                }
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            done();
        })
    })

    it('Lorax: Empty AND should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            done();
        })
    })

    it('Malibu: Empty OR should result in 400.', function (done) {
        IF.performQuery({
            WHERE:{
                "OR":[]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect.fail();
        }).catch(function (err:InsightResponse) {
            expect(err.code).to.equal(400);
            console.log(err.body);
            done();
        })
    })

    it('Mango: Contradictory query should be valid', function (done) {
        IF.performQuery({
            WHERE:{
                "AND":[
                    {
                        "IS":{
                            "courses_instructor":""
                        }
                    },
                    {
                        "IS":{
                            "courses_instructor":"kiczales, gregor"
                        }
                    }
                ]
            },
            OPTIONS:{
                COLUMNS:[
                    "courses_avg",
                    "courses_title"
                ],
                ORDER:"courses_avg",
                FORM:"TABLE"
            }

        }).then(function (data:InsightResponse) {
            expect(data.code).to.equal(200);

            done();
        }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    })

    //Remove dataset for each test
    xit('remove dataSet successful', function(done) {
        IF.removeDataset("courses")
            .then(function (data:InsightResponse) {
                expect(data.code).to.equal(204);
                console.log(data.body);
                done();
            }).catch(function (err:InsightResponse) {
            expect.fail();
        })
    });
    */
});