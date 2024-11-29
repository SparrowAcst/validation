module.exports = [

    /////////////////////////////////////////////////////////////////////////////
    // {
    //     source: "sparrow.H2",
    //     dest: `strazhesko-part-1.labels`,
    //     pipeline: [{
    //             $match: {
    //                 Clinic: "STRAZHESKO"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-EXAMINATION",
    //     dest: `strazhesko-part-1.examinations`,
    //     pipeline: [{
    //             $match: {
    //                 siteId: "c42ac1bd-ae37-4a47-b431-44cf4d886be1"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-FORM",
    //     dest: `strazhesko-part-1.forms`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "H2-EXAMINATION",
    //                 localField: "examinationId",
    //                 foreignField: "id",
    //                 as: "examination",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         siteId: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 examination: {
    //                     $first: "$examination",
    //                 },
    //             },
    //         },
    //         {
    //             $match: {
    //                 "examination.siteId": "c42ac1bd-ae37-4a47-b431-44cf4d886be1",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "sparrow.H2-SEGMENTATION",
    //     dest: `strazhesko-part-1.segmentations`,
    //     pipeline: [{
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },
    ///////////////////////////////////////////////////////////////////////////////
    // {
    //     source: "sparrow.H2",
    //     dest: `potashev-part-1.labels`,
    //     pipeline: [{
    //             $match: {
    //                 Clinic: "POTASHEV"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-EXAMINATION",
    //     dest: `potashev-part-1.examinations`,
    //     pipeline: [{
    //             $match: {
    //                 siteId: "2031ce83-3eef-4c0d-8e01-192f47146a99"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-FORM",
    //     dest: `potashev-part-1.forms`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "H2-EXAMINATION",
    //                 localField: "examinationId",
    //                 foreignField: "id",
    //                 as: "examination",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         siteId: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 examination: {
    //                     $first: "$examination",
    //                 },
    //             },
    //         },
    //         {
    //             $match: {
    //                 "examination.siteId": "2031ce83-3eef-4c0d-8e01-192f47146a99",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "sparrow.H2-SEGMENTATION",
    //     dest: `potashev-part-1.segmentations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },



    /////////////////////////////////////////////////////////////////////////////////    
    // {
    //     source: "sparrow.H2",
    //     dest: `denis-part-1.labels`,
    //     pipeline: [{
    //             $match: {
    //                 Clinic: "Denis"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-EXAMINATION",
    //     dest: `denis-part-1.examinations`,
    //     pipeline: [{
    //             $match: {
    //                 siteId: "9a5f35a0-f1ba-4b68-96e6-582cd12a7523"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-FORM",
    //     dest: `denis-part-1.forms`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "H2-EXAMINATION",
    //                 localField: "examinationId",
    //                 foreignField: "id",
    //                 as: "examination",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         siteId: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 examination: {
    //                     $first: "$examination",
    //                 },
    //             },
    //         },
    //         {
    //             $match: {
    //                 "examination.siteId": "9a5f35a0-f1ba-4b68-96e6-582cd12a7523",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },


    // {
    //     source: "sparrow.H2-SEGMENTATION",
    //     dest: `denis-part-1.segmentations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    //////////////////////////////////////////////////////////////////////////////////    
    // {
    //     source: "sparrow.H2",
    //     dest: `poltava-part-1.labels`,
    //     pipeline: [{
    //             $match: {
    //                 Clinic: "POLTAVA"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-EXAMINATION",
    //     dest: `poltava-part-1.examinations`,
    //     pipeline: [{
    //             $match: {
    //                 siteId: "c74f57b8-6106-4ee7-b4ff-c13a14ca8791"
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // },

    // {
    //     source: "sparrow.H2-FORM",
    //     dest: `poltava-part-1.forms`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "H2-EXAMINATION",
    //                 localField: "examinationId",
    //                 foreignField: "id",
    //                 as: "examination",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         siteId: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 examination: {
    //                     $first: "$examination",
    //                 },
    //             },
    //         },
    //         {
    //             $match: {
    //                 "examination.siteId": "c74f57b8-6106-4ee7-b4ff-c13a14ca8791",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },


    // {
    //     source: "sparrow.H2-SEGMENTATION",
    //     dest: `poltava-part-1.segmentations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    ///////////////////////////////////////////////////////////////////////////////////

	{
        source: "sparrow.yoda",
        dest: `yoda.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.yoda-exams",
        dest: `yoda.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.yoda-forms-upd",
        dest: `yoda.forms`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                },
            },
        ]
    },


    {
        source: "sparrow.yoda-SEGMENTATION",
        dest: `yoda.segmentations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                },
            },
        ]
    },

    ////////////////////////////////////////////////////////////////////////////////////

    {
        source: "sparrow.phonendo",
        dest: `phonendo.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.phonendo-exams",
        dest: `phonendo.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.phonendo-forms",
        dest: `phonendo.forms`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                },
            },
        ]
    },


    // {
    //     source: "sparrow.phonendo-SEGMENTATION",
    //     dest: `phonendo.segmentations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    ////////////////////////////////////////////////////////////////////////////////////


    {
        source: "sparrow.digiscope",
        dest: `digiscope.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.digiscope-exams",
        dest: `digiscope.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.digiscope-forms",
        dest: `digiscope.forms`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                },
            },
        ]
    },


    // {
    //     source: "sparrow.phonendo-SEGMENTATION",
    //     dest: `phonendo.segmentations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    ////////////////////////////////////////////////////////////////////////////////////



    {
        source: "sparrow.hha",
        dest: `hha.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.hha-examination",
        dest: `hha.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.hha-form",
        dest: `hha.forms`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                },
            },
        ]
    },


    // {
    //     source: "sparrow.phonendo-SEGMENTATION",
    //     dest: `phonendo.segmentations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    ////////////////////////////////////////////////////////////////////////////////////




    {
        source: "sparrow.harvest1",
        dest: `hh1.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.examination",
        dest: `hh1.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.form-upd",
        dest: `hh1.forms`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                },
            },
        ]
    },


    // {
    //     source: "sparrow.phonendo-SEGMENTATION",
    //     dest: `phonendo.segmentations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    ////////////////////////////////////////////////////////////////////////////////////


]