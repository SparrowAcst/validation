module.exports = [

        /////////////////////////////////////////////////////////////////////////////
        {
            source: "sparrow.harvest1",
            dest: `sparrow.harvest1-upd`,
            pipeline: [{
                    $lookup: {
                        from: "harvest1-path",
                        localField: "id",
                        foreignField: "id",
                        as: "result",
                    },
                },
                {
                    $addFields: {
                        result: {
                            $first: "$result",
                        },
                    },
                },
                {
                    $addFields: {
                        path: {
                            $concat: [
                                "transferred_data-collection-28cdc/",
                                "$result.path",
                                ".wav",
                            ],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        result: 0,
                    },
                }
            ]
            },

         
            ////////////////////////////////////////////////////////////////////////////////////


        ]