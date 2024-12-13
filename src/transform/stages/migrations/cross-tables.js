module.exports = (schema, target) => {
    return [{
            source: `${schema}.labels`,
            dest: `ADE-TRANSFORM.cross-examinations`,
            pipeline: [{
                    $group: {
                        _id: "$src.Examination ID",
                        source_patientId: {
                            $first: "$src.Examination ID",
                        },
                        source_collection: {
                            $first: "$src.patientCollection",
                        },
                        target_patientId: {
                            $first: "$Examination ID",
                        },
                    },
                },
                {
                    $lookup: {
                        from: "examinations",
                        localField: "target_patientId",
                        foreignField: "patientId",
                        as: "target_examination",
                        pipeline: [{
                            $project: {
                                _id: 0,
                                crashed: 1,
                                id: "$uuid",
                                collection: "$schema",
                            },
                        }, ],
                    },
                },
                {
                    $addFields: {
                        crashed: {
                            $first: "$target_examination.crashed",
                        },
                        target_id: {
                            $first: "$target_examination.id",
                        },
                        target_collection: {
                            $first: "$target_examination.collection",
                        },
                    },
                },
                {
                    $addFields: {
                        source: {
                            patientId: "$source_patientId",
                            collection: "$source_collection",
                        },
                        target: {
                            id: "$target_id",
                            patientId: "$target_patientId",
                            schema: {
                                $cond: [{
                                        $eq: ["$crashed", true],
                                    },
                                    "ADE-TRANSFORM.examinations",
                                    "$target_collection",
                                ],
                            },
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
        },
        {
            source: `${schema}.labels`,
            dest: `ADE-TRANSFORM.cross-labels`,
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
                            },
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
                            collection: {
                                $cond: [{
                                        $eq: ["$crashed", true]
                                    },
                                    "ADE-TRANSFORM.labels",
                                    "${target}.labels"
                                ]
                            }
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
        },
        // {
        //     source: `${schema}.labels`,
        //     dest: `ADE-TRANSFORM.cross-crashed-examinations`,
        //     pipeline: [{
        //             $group: {
        //                 _id: "$src.Examination ID",
        //                 "Examination ID": {
        //                     $first: "$Examination ID",
        //                 },
        //                 src: {
        //                     $first: "$src",
        //                 },
        //             },
        //         },
        //         {
        //             $lookup: {
        //                 from: "examinations",
        //                 localField: "Examination ID",
        //                 foreignField: "patientId",
        //                 as: "examination",
        //                 pipeline: [{
        //                     $project: {
        //                         _id: 0,
        //                         crashed: 1,
        //                         id: "$uuid",
        //                         patientId: "$patientId",
        //                         src: 1,
        //                     },
        //                 }, ],
        //             },
        //         },
        //         {
        //             $addFields: {
        //                 crashed: {
        //                     $first: "$examination.crashed",
        //                 },
        //                 id: {
        //                     $first: "$examination.id",
        //                 },
        //                 collection: {
        //                     $first: "$examination.src.collection",
        //                 },
        //             },
        //         },
        //         {
        //             $addFields: {
        //                 source: {
        //                     patientId: "$src.Examination ID",
        //                     collection: "$src.patientCollection",
        //                 },
        //                 target: {
        //                     id: "$id",
        //                     patientId: "$Examination ID",
        //                     collection: "ADE-TRANSFORM.examinations",
        //                 },
        //             },
        //         },
        //         {
        //             $project: {
        //                 _id: 0,
        //                 source: 1,
        //                 target: 1,
        //                 crashed: 1,
        //             },
        //         },
        //     ]
        // }, 
        // {
        //     source: `${schema}.labels`,
        //     dest: `ADE-TRANSFORM.cross-crashed-labels`,
        //     pipeline: [{
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
        //         },
        //         {
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
        //                 }]
        //             }
        //         },
        //         {
        //             $addFields: {
        //                 crashed: {
        //                     $first: "$examination.crashed"
        //                 }
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: "$record"
        //             }
        //         },
        //         {
        //             $addFields: {
        //                 source: "$record",
        //                 target: {
        //                     id: "$record.id",
        //                     "Examination ID": "$Examination ID",
        //                     collection: "ADE-TRANSFORM.labels"
        //                 }
        //             }
        //         },
        //         {
        //             $project: {
        //                 _id: 0,
        //                 source: 1,
        //                 target: 1,
        //                 crashed: 1
        //             }
        //         }
        //     ]
        // }
    ]
}