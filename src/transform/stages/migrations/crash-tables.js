module.exports = (schema, target) => {
    return [

        {
            source: `ADE-TRANSFORM.labels`,
            dest: `ADE-TRANSFORM.pool-examinations`,
            pipeline: [{
                    $group: {
                        _id: "$src.Examination ID",
                        source_patientId: {
                            $first: "$src.Examination ID",
                        },
                        source_uuid: {
                            $first: "$src.uuid",
                        },
                        source_collection: {
                            $first: "$src.patientCollection",
                        },
                        source_formCollection: {
                            $first: "$src.formCollection",
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
                            uuid: "$source_uuid",
                            patientId: "$source_patientId",
                            collection: "$source_collection",
                            form_collection: "$source_formCollection",
                        },
                        target: {
                            id: "$target_id",
                            patientId: "$target_patientId",
                            schema: "ADE-TRANSFORM"
                        },
                        id: {
                            $function: {
                                body: `function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            }`,
                                args: [],
                                lang: "js",
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        source: 1,
                        target: 1,
                        crashed: 1,
                    },
                },
            ]
        },
        {
            source: `ADE-TRANSFORM.labels`,
            dest: `ADE-TRANSFORM.pool-labels`,
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
                            schema: "ADE-TRANSFORM"
                        },
                        id: {
                            $function: {
                                body: `function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            }`,
                                args: [],
                                lang: "js",
                            },
                        },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        source: 1,
                        target: 1,
                        crashed: 1
                    }
                }
            ]
        }
    ]
}