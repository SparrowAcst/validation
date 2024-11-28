module.exports = [

    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.strazhesko-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "c42ac1bd-ae37-4a47-b431-44cf4d886be1"
                }
            },
            {
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
            }
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.potashev-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "2031ce83-3eef-4c0d-8e01-192f47146a99"
                }
            },
            {
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
            }
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.denis-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "9a5f35a0-f1ba-4b68-96e6-582cd12a7523"
                }
            },
            {
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
            }
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.poltava-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "c74f57b8-6106-4ee7-b4ff-c13a14ca8791"
                }
            },
            {
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
            }
        ]
    },





    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.strazhesko-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "c42ac1bd-ae37-4a47-b431-44cf4d886be1"
                }
            },
            [{
                    $match: {
                        type: "echo",
                        "data.en.resolvedData.error": {
                            $exists: false,
                        },
                    },
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
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.potashev-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "2031ce83-3eef-4c0d-8e01-192f47146a99"
                }
            },
            [{
                    $match: {
                        type: "echo",
                        "data.en.resolvedData.error": {
                            $exists: false,
                        },
                    },
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
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.denis-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "9a5f35a0-f1ba-4b68-96e6-582cd12a7523"
                }
            },
            [{
                    $match: {
                        type: "echo",
                        "data.en.resolvedData.error": {
                            $exists: false,
                        },
                    },
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
        ]
    },
    {
        source: "sparrow.H2-FORM",
        dest: `ADE-ENCODING.poltava-part-1-files`,
        pipeline: [{
                $match: {
                    siteId: "c74f57b8-6106-4ee7-b4ff-c13a14ca8791"
                }
            },
            [{
                    $match: {
                        type: "echo",
                        "data.en.resolvedData.error": {
                            $exists: false,
                        },
                    },
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
        ]
    }

]