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
                                schema: "$schema",
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
                        target_schema: target,
                        // {
                        //   $first: "$target_examination.collection",
                        // },
                    },
                },
                {
                    $addFields: {
                        source: {
                            patientId: "$source_patientId",
                            collection: "$source_collection",
                            form_collection: "$source_formCollection",
                        },
                        target: {
                            id: "$target_id",
                            patientId: "$target_patientId",
                            schema: {
                                $cond: [{
                                        $eq: ["$crashed", true],
                                    },
                                    "ADE-TRANSFORM",
                                    "$target_schema",
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
                            $first: "$Examination ID",
                        },
                        src: {
                            $first: "$src",
                        },
                        record: {
                            $push: "$src",
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
                            },
                        }, ],
                    },
                },
                {
                    $addFields: {
                        crashed: {
                            $first: "$examination.crashed",
                        },
                    },
                },
                {
                    $unwind: {
                        path: "$record",
                    },
                },
                {
                    $addFields: {
                        source: "$record",
                        target: {
                            id: "$record.id",
                            "Examination ID": "$Examination ID",
                            schema: {
                                $cond: [{
                                        $eq: ["$crashed", true],
                                    },
                                    "ADE-TRANSFORM",
                                    target,
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

    ]
}