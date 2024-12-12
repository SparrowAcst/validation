module.exports = [

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "strazhesko-part-1.labels",
        dest: `strazhesko-part-1-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.H2",
                        patientCollection:"sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "strazhesko-part-1.examinations",
        dest: `strazhesko-part-1-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "potashev-part-1.labels",
        dest: `potashev-part-1-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.H2",
                        patientCollection:"sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "potashev-part-1.examinations",
        dest: `potashev-part-1-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
    /////////////////////////////////////////////////////////////////////////////
    {
        source: "denis-part-1.labels",
        dest: `denis-part-1-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.H2",
                        patientCollection:"sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "denis-part-1.examinations",
        dest: `denis-part-1-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
    /////////////////////////////////////////////////////////////////////////////
    {
        source: "poltava-part-1.labels",
        dest: `poltava-part-1-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.H2",
                        patientCollection:"sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "poltava-part-1.examinations",
        dest: `poltava-part-1-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.H2-EXAMINATION",
                        formCollection: "sparrow.H2-FORM",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "phonendo.labels",
        dest: `phonendo-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.phonendo",
                        patientCollection:"sparrow.phonendo-exams",
                        formCollection: "sparrow.phonendo-forms",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "phonendo.examinations",
        dest: `phonendo-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.phonendo-exams",
                        formCollection: "sparrow.phonendo-forms",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },


    /////////////////////////////////////////////////////////////////////////////
    {
        source: "digiscope.labels",
        dest: `digiscope-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.digiscope",
                        patientCollection:"sparrow.digiscope-exams",
                        formCollection: "sparrow.digiscope-forms",
                    
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "digiscope.examinations",
        dest: `digiscope-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.digiscope-exams",
                        formCollection: "sparrow.digiscope-forms",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "yoda.labels",
        dest: `yoda-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.yoda",
                        patientCollection:"sparrow.yoda-exams",
                        formCollection: "sparrow.yoda-forms-upd",
                    
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "yoda.examinations",
        dest: `yoda-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.yoda-exams",
                        formCollection: "sparrow.yoda-forms-upd",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "hha.labels",
        dest: `hha-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.hha",
                        patientCollection:"sparrow.hha-examinamtion",
                        formCollection: "sparrow.hha-form",
                    
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "hha.examinations",
        dest: `hha-mix.examinations`,
        pipeline: [{
            $addFields: {
                src: {
                    patientId: "$patientId",
                    collection: "sparrow.hha-examinamtion",
                    formCollection: "sparrow.hha-form",
                }
            }
        }, {
            $project: {
                _id: 0
            }
        }]
    },

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "harvest1.labels",
        dest: `harvest1-mix.labels`,
        pipeline: [{
                $addFields: {
                    src: {
                        id: "$id",
                        "Examination ID": "$Examination ID",
                        collection: "sparrow.harvest1",
                        patientCollection:"sparrow.examination",
                        formCollection: "sparrow.form-upd"
                    
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "harvest1.examinations",
        dest: `harvest1-mix.examinations`,
        pipeline: [{
                $addFields: {
                    src: {
                        patientId: "$patientId",
                        collection: "sparrow.examination",
                        formCollection: "sparrow.form-upd",
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    }

]