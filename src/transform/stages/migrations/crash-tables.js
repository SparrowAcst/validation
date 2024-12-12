module.exports = (schema, target) => {
    return [
    // {
    //         source: `${schema}.labels`,
    //         dest: `ADE-TRANSFORM.cross-examinations`,
    //         pipeline: [{
    //             $group: {
    //                 _id: "$src.Examination ID",
    //                 "Examination ID": {
    //                     $first: "$Examination ID"
    //                 },
    //                 src: {
    //                     $first: "$src"
    //                 },
    //                 record: {
    //                     $push: "$src"
    //                 }
    //             }
    //         }, {
    //             $lookup: {
    //                 from: "examinations",
    //                 localField: "Examination ID",
    //                 foreignField: "patientId",
    //                 as: "examination",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         crashed: 1
    //                     }
    //                 }],
    //             },
    //         }, {
    //             $addFields: {
    //                 crashed: {
    //                     $first: "$examination.crashed"
    //                 }
    //             }
    //         }, {
    //             $addFields: {
    //                 source: "$src",
    //                 target: {
    //                     id: "$src.id",
    //                     patientId: "$Examination ID",
    //                     collection: {
    //                         $cond: [{
    //                                 $eq: ["$crashed", true]
    //                             },
    //                             "ADE-TRANSFORM.examinations",
    //                             `${target}.examinations`
    //                         ]
    //                     }
    //                 }
    //             },
    //         }, {
    //             $project: {
    //                 _id: 0,
    //                 source: 1,
    //                 target: 1,
    //                 crashed: 1
    //             }
    //         }]
    //     },
    //     {
    //         source: `${schema}.labels`,
    //         dest: `ADE-TRANSFORM.cross-labels`,
    //         pipeline: [{
    //                 $group: {
    //                     _id: "$src.Examination ID",
    //                     "Examination ID": {
    //                         $first: "$Examination ID"
    //                     },
    //                     src: {
    //                         $first: "$src"
    //                     },
    //                     record: {
    //                         $push: "$src"
    //                     }
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: "examinations",
    //                     localField: "Examination ID",
    //                     foreignField: "patientId",
    //                     as: "examination",
    //                     pipeline: [{
    //                         $project: {
    //                             _id: 0,
    //                             crashed: 1
    //                         },
    //                     }]
    //                 }
    //             },
    //             {
    //                 $addFields: {
    //                     crashed: {
    //                         $first: "$examination.crashed"
    //                     }
    //                 }
    //             },
    //             {
    //                 $unwind: {
    //                     path: "$record"
    //                 }
    //             },
    //             {
    //                 $addFields: {
    //                     source: "$record",
    //                     target: {
    //                         id: "$record.id",
    //                         "Examination ID": "$Examination ID",
    //                         collection: {
    //                             $cond: [{
    //                                     $eq: ["$crashed", true]
    //                                 },
    //                                 "ADE-TRANSFORM.labels",
    //                                 "${target}.labels"
    //                             ]
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     _id: 0,
    //                     source: 1,
    //                     target: 1,
    //                     crashed: 1
    //                 }
    //             }
    //         ]
    //     }, 
        {
            source: `ADE-TRANSFORM.labels`,
            dest: `ADE-TRANSFORM.cross-crash-examinations`,
            pipeline: [{
                    $group: {
                        _id: "$src.Examination ID",
                        "Examination ID": {
                            $first: "$Examination ID",
                        },
                        src: {
                            $first: "$src",
                        },
                    },
                },
                {
                    $lookup: {
                        from: "examinations",
                        localField: "Examination ID",
                        foreignField: "patientId",
                        as: "examination",
                        pipeline: [{
                            $project: {
                                _id: 0,
                                crashed: 1,
                                id: "$uuid",
                                patientId: "$patientId",
                                src: 1,
                            },
                        }, ],
                    },
                },
                {
                    $addFields: {
                        crashed: {
                            $first: "$examination.crashed",
                        },
                        id: {
                            $first: "$examination.id",
                        },
                        collection: {
                            $first: "$examination.src.collection",
                        },
                    },
                },
                {
                    $addFields: {
                        source: {
                            patientId: "$src.Examination ID",
                            collection: "$src.patientCollection",
                        },
                        target: {
                            id: "$id",
                            patientId: "$Examination ID",
                            collection: "ADE-TRANSFORM.examinations",
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        source: 1,
                        target: 1,
                        crashed: 1,
                    },
                },
            ]
        }, {
            source: `ADE-TRANSFORM.labels`,
            dest: `ADE-TRANSFORM.cross-crash-labels`,
            pipeline: [{
                    $group: {
                        _id: "$src.Examination ID",
                        "Examination ID": {
                            $first: "$Examination ID"
                        },
                        src: {
                            $first: "$src"
                        },
                        record: {
                            $push: "$src"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "examinations",
                        localField: "Examination ID",
                        foreignField: "patientId",
                        as: "examination",
                        pipeline: [{
                            $project: {
                                _id: 0,
                                crashed: 1
                            }
                        }]
                    }
                },
                {
                    $addFields: {
                        crashed: {
                            $first: "$examination.crashed"
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$record"
                    }
                },
                {
                    $addFields: {
                        source: "$record",
                        target: {
                            id: "$record.id",
                            "Examination ID": "$Examination ID",
                            collection: "ADE-TRANSFORM.labels"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        source: 1,
                        target: 1,
                        crashed: 1
                    }
                }
            ]
        }
    ]
}