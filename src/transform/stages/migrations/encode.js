module.exports = schema => [{
        source: `${schema}.labels`,
        dest: `ADE-ENCODING.labels`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1,
                schema: schema
            },
        }, ]
    },
    {
        source: `${schema}.examinations`,
        dest: `ADE-ENCODING.examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1,
                schema: schema
            },
        }, ]
    },

    {
        source: `${schema}.examinations`,
        dest: `ADE-ENCODING.attachements`,
        pipeline: [{
                $project: {
                    patientId: 1,
                    ref: "$forms.attachements.data",
                    resolved: "$forms.attachements.resolvedData",
                },
            },
            {
                $unwind: {
                    path: "$ref",
                    includeArrayIndex: "refIndex",
                },
            },
            {
                $unwind: {
                    path: "$resolved",
                    includeArrayIndex: "resolvedIndex",
                },
            },
            {
                $match: {
                    $expr: {
                        $eq: ["$refIndex", "$resolvedIndex"],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    refUrl: "$ref.url",
                    refPath: "$ref.path",
                    path: "$resolved.path",
                    schema: schema
                },
            },
        ]

    },

    {
        source: `${schema}.examinations`,
        dest: `ADE-ENCODING.echos`,
        pipeline: [{
            $project: {
                _id: 0,
                refUrl: "$forms.echo.data.dataUrl",
                refPath: "$forms.echo.data.dataPath",
                path: "$forms.echo.data.resolvedData.dataPath",
                schema: schema
            },
        }, ]
    },

]