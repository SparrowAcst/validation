module.exports = [{
        collection: "labels",
        command: "aggregate",
        pipeline: [{
                $match: {
                    type: "attachements",
                },
            },
            {
                $unwind: {
                    path: "$data",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $set: {
                    "data.id": {
                        $function: {
                            body: function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            },
                            args: [],
                            lang: "js",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
            {
                $out: "attachements",
            },
        ]

    },


    {
        collection: "labels",
        command: "aggregate",
        pipeline: [{
                $match: {
                    type: "echo",
                },
            },
            {
                $set: {
                    dataFileId: {
                        $function: {
                            body: function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            },
                            args: [],
                            lang: "js",
                        },
                    },
                },
            },
            {
                $out: "echo",
            },
        ]

    },
]