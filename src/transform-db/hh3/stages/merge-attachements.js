module.exports = [{
        collection: "attachements-processed",
        command: "aggregate",
        pipeline: [{
                $group: {
                    _id: "$id",
                    id: {
                        $first: "$id",
                    },
                    examinationId: {
                        $first: "$examinationId",
                    },
                    data: {
                        $push: "$data",
                    },
                    patientId: {
                        $first: "$patientId",
                    },
                },
            },
            {
                $addFields: {
                    type: "attachements",
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
            {
                $out: "form-attachements",
            },
        ]

    },



]