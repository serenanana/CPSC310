"use strict";
var chai_1 = require("chai");
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe('InsightFacadeSpec2', function () {
    var fs = require("fs");
    var IF = new InsightFacade_1.default();
    it('remove dataSet successful', function (done) {
        IF.removeDataset("rooms")
            .then(function (data) {
            console.log(data.body);
            done();
        }).catch(function (err) {
            console.log(err.body);
            done();
        });
    });
    it('add Course dataSet successful', function (done) {
        fs.readFile("./courses.zip", function (err, data) {
            if (err)
                throw err;
            IF.addDataset("courses", data.toString("base64")).then(function (data) {
                console.log(data.code);
                console.log(data.body);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        });
    });
    it('add Room dataSet successful', function (done) {
        fs.readFile("./rooms.zip", function (err, data) {
            if (err)
                throw err;
            IF.addDataset("rooms", data.toString("base64")).then(function (data) {
                console.log(data.code);
                console.log(data.body);
                done();
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        });
    });
    it('add Room dataSet wrong id', function (done) {
        fs.readFile("./rooms.zip", function (err, data) {
            if (err)
                throw err;
            IF.addDataset("123", data.toString("base64")).then(function (data) {
                chai_1.expect.fail();
            })
                .catch(function (err) {
                chai_1.expect(err.code).to.equal(400);
                console.log(err.body);
                done();
            });
        });
    });
    it('Simplest Query', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "AERL_120"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_shortname"
                ],
                "ORDER": "rooms_shortname",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it('Query A', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it('Query B', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_address": "*Agrono*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address",
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
            done();
        });
    });
    it('Argon: Should be able to find rooms in a specific building.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_number",
                    "rooms_name"
                ],
                "ORDER": "rooms_number",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Canary: Should be able to query with AND and OR.', function (done) {
        IF.performQuery({
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "EQ": {
                                    "rooms_lat": 49.26125
                                }
                            },
                            {
                                "EQ": {
                                    "rooms_lon": -123.24807
                                }
                            }
                        ]
                    },
                    {
                        "IS": {
                            "rooms_shortname": "AERL"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "ORDER": "rooms_address",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Diesel: Should be able to find address of a building given lat and lon.', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "EQ": {
                            "rooms_lat": 49.26125
                        }
                    },
                    {
                        "EQ": {
                            "rooms_lon": -123.24807
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_type"
                ],
                "ORDER": "rooms_type",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Einstein: Should be able to find lat and lon given address of a building.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_address": "2202 Main Mall"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_lat",
                    "rooms_lon"
                ],
                "ORDER": "rooms_lat",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Fluorine: Should be able to find the year a course is offered in.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "courses_title": "comm & info thry"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_year",
                    "courses_title"
                ],
                "ORDER": "courses_year",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Germanium: Should be able to find rooms with tables.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_furniture": "*Tables*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_furniture",
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Gallium: Filter by courses year.', function (done) {
        IF.performQuery({
            "WHERE": {
                "EQ": {
                    "courses_year": 1900
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_title", "courses_year"
                ],
                "ORDER": "courses_year",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Googolplex: Filter by room fullnames.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_fullname": "Life Sciences Centre"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_fullname"
                ],
                "ORDER": "rooms_fullname",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Hopper: Filter by room names.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "BRKX_2365"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Helium: Filter by partial href.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_href": "*DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_href", "rooms_name"
                ],
                "ORDER": "rooms_href",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Hydrogen: Should be able to find hyperlink for rooms.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_href": "*ANSO-202"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_href",
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Kleene: Find all group type rooms without some furniture.', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "IS": {
                            "rooms_type": "*Group"
                        }
                    },
                    {
                        "NOT": {
                            "IS": {
                                "rooms_furniture": "*Furniture*"
                            }
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_type",
                    "rooms_lon",
                    "rooms_furniture"
                ],
                "ORDER": "rooms_lon",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Knuth: Find all studio type rooms without some furniture.', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "IS": {
                            "rooms_type": "*Studio*"
                        }
                    },
                    {
                        "NOT": {
                            "IS": {
                                "rooms_furniture": "*Furniture*"
                            }
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_type",
                    "rooms_furniture"
                ],
                "ORDER": "rooms_type",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Leo: Find all group type rooms in a specific building which can fit more than some number of people.', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "IS": {
                            "rooms_type": "*Group*"
                        }
                    },
                    {
                        "IS": {
                            "rooms_shortname": "DMP"
                        }
                    },
                    {
                        "GT": {
                            "rooms_seats": 50
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_seats",
                    "rooms_name",
                    "rooms_type"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Liberation: Find all non-studio type rooms with certain number of seats, excluding a specific building.', function (done) {
        IF.performQuery({
            "WHERE": {
                "AND": [
                    {
                        "NOT": {
                            "IS": {
                                "rooms_type": "*Studio*"
                            }
                        }
                    },
                    {
                        "EQ": {
                            "rooms_seats": 200
                        }
                    },
                    {
                        "NOT": {
                            "IS": {
                                "rooms_shortname": "DMP"
                            }
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_seats",
                    "rooms_name",
                    "rooms_type"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Argon: Should be able to find rooms in a specific building.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Lead: Invalid query should result in 400.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Metro: Should be able to find rooms with more than a certain number of seats.', function (done) {
        IF.performQuery({
            "WHERE": {
                "GT": {
                    "rooms_seats": 200
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_seats", "rooms_name"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Moonshine: Should be able to find some small rooms on campus.', function (done) {
        IF.performQuery({
            "WHERE": {
                "LT": {
                    "rooms_seats": 30
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_seats", "rooms_name"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Nautilus: Should be able to find all rooms of a certain type.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_type": "*Small*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_type", "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Nitro: Should be able to find all rooms with a certain type of furniture.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_furniture": "Classroom-Movable Tables & Chairs"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_lat",
                    "rooms_furniture",
                    "rooms_name"
                ],
                "ORDER": "rooms_lat",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Odyssey: Should be able to find all rooms within a certain bounding box.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('OkelyDokely: Should be able to find all rooms outside a certain bounding box.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Omega: Should be able to find some specific rooms.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_name": "FRDM_153"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Onomatopoeia: Should be able to handle a deep query.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Orion: Should be able to handle a deep query.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Oxygen: Invalid query should result in 400.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it('Pisces: Should be able to sort urls.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "ANSO"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_href", "rooms_name"
                ],
                "ORDER": "rooms_href",
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Platinum: Should be able to query all valid keys.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Potassium: Invalid keys should result in 400.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Prelude: Deeply nested query should be supported.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    xit('Quantum: Should be able to query with a valid key.', function (done) {
        IF.performQuery({
            "WHERE": {
                "IS": {
                    "rooms_shortname": "DMP*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        }).then(function (data) {
            chai_1.expect(data.code).to.equal(200);
            console.log(data.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=InstightFacadeSpec2.js.map