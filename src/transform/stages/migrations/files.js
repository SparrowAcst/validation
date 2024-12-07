module.exports = [

    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.strazhesko-part-1-files`,
        pipeline: [{
                $match: {
                    type: "attachements",
                    resolvedData: {
                        $elemMatch: {
                            error: {
                                $exists: false,
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "c42ac1bd-ae37-4a47-b431-44cf4d886be1",
                },
            },
            {
                $unwind: {
                    path: "$data",
                    includeArrayIndex: "dataIndex",
                },
            },
            {
                $unwind: {
                    path: "$resolvedData",
                    includeArrayIndex: "resolvedDataIndex",
                },
            },
            {
                $match: {
                    $expr: {
                        $eq: ["$dataIndex", "$resolvedDataIndex"],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    path: "$resolvedData.path",
                    refUrl: "$data.url",
                    refPath: "$data.path",
                },
            },
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.potashev-part-1-files`,
        pipeline: [{
                $match: {
                    type: "attachements",
                    resolvedData: {
                        $elemMatch: {
                            error: {
                                $exists: false,
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "2031ce83-3eef-4c0d-8e01-192f47146a99",
                },
            },
            {
                $unwind: {
                    path: "$data",
                    includeArrayIndex: "dataIndex",
                },
            },
            {
                $unwind: {
                    path: "$resolvedData",
                    includeArrayIndex: "resolvedDataIndex",
                },
            },
            {
                $match: {
                    $expr: {
                        $eq: ["$dataIndex", "$resolvedDataIndex"],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    path: "$resolvedData.path",
                    refUrl: "$data.url",
                    refPath: "$data.path",
                },
            },
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.denis-part-1-files`,
        pipeline: [{
                $match: {
                    type: "attachements",
                    resolvedData: {
                        $elemMatch: {
                            error: {
                                $exists: false,
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "9a5f35a0-f1ba-4b68-96e6-582cd12a7523",
                },
            },
            {
                $unwind: {
                    path: "$data",
                    includeArrayIndex: "dataIndex",
                },
            },
            {
                $unwind: {
                    path: "$resolvedData",
                    includeArrayIndex: "resolvedDataIndex",
                },
            },
            {
                $match: {
                    $expr: {
                        $eq: ["$dataIndex", "$resolvedDataIndex"],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    path: "$resolvedData.path",
                    refUrl: "$data.url",
                    refPath: "$data.path",
                },
            },
        ],
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.poltava-part-1-files`,
        pipeline: [{
                $match: {
                    type: "attachements",
                    resolvedData: {
                        $elemMatch: {
                            error: {
                                $exists: false,
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "c74f57b8-6106-4ee7-b4ff-c13a14ca8791",
                },
            },
            {
                $unwind: {
                    path: "$data",
                    includeArrayIndex: "dataIndex",
                },
            },
            {
                $unwind: {
                    path: "$resolvedData",
                    includeArrayIndex: "resolvedDataIndex",
                },
            },
            {
                $match: {
                    $expr: {
                        $eq: ["$dataIndex", "$resolvedDataIndex"],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    path: "$resolvedData.path",
                    refUrl: "$data.url",
                    refPath: "$data.path",
                },
            },
        ]
    },


    /////////////////////////////////////////////////////////////////////////////////////////////


    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.strazhesko-part-1-files`,
        pipeline: [{
                $match: {
                    type: "echo",
                    "data.en.resolvedData.error": {
                        $exists: false,
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "c42ac1bd-ae37-4a47-b431-44cf4d886be1"
                }
            },
            {
                $project: {
                    _id: 0,
                    path: "$data.en.resolvedData.dataPath",
                    refUrl: "$data.en.dataUrl",
                    refPath: "$data.en.dataPath",
                },
            },
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.potashev-part-1-files`,
        pipeline: [{
                $match: {
                    type: "echo",
                    "data.en.resolvedData.error": {
                        $exists: false,
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "2031ce83-3eef-4c0d-8e01-192f47146a99"
                }
            },
            {
                $project: {
                    _id: 0,
                    path: "$data.en.resolvedData.dataPath",
                    refUrl: "$data.en.dataUrl",
                    refPath: "$data.en.dataPath",
                },
            },
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.denis-part-1-files`,
        pipeline: [{
                $match: {
                    type: "echo",
                    "data.en.resolvedData.error": {
                        $exists: false,
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "9a5f35a0-f1ba-4b68-96e6-582cd12a7523"
                }
            },
            {
                $project: {
                    _id: 0,
                    path: "$data.en.resolvedData.dataPath",
                    refUrl: "$data.en.dataUrl",
                    refPath: "$data.en.dataPath",
                },
            },
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.poltava-part-1-files`,
        pipeline: [{
                $match: {
                    type: "echo",
                    "data.en.resolvedData.error": {
                        $exists: false,
                    },
                },
            },
            {
                $lookup: {
                    from: "H2-EXAMINATION",
                    localField: "examinationId",
                    foreignField: "id",
                    as: "examination",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            siteId: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examination: {
                        $first: "$examination",
                    },
                },
            },
            {
                $match: {
                    "examination.siteId": "c74f57b8-6106-4ee7-b4ff-c13a14ca8791"
                }
            },
            {
                $project: {
                    _id: 0,
                    path: "$data.en.resolvedData.dataPath",
                    refUrl: "$data.en.dataUrl",
                    refPath: "$data.en.dataPath",
                },
            },
        ]
    }

]