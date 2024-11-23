const DS = require("../../utils/ds-map")["denis-part-1"]
module.exports = [{
        source: "sparrow.H2",
        dest: `${DS}.labels`,
        pipeline: [{
            $match: {
                Clinic: "Denis"
            },
        }]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `${DS}.forms`,
        pipeline: [{
                $match: {
                    org: "Denis",
                },
            },
            {
                $lookup: {
                    from: "H2-FORM",
                    localField: "patientId",
                    foreignField: "patientId",
                    as: "forms",
                    pipeline: [{
                        $project: {
                            _id: 0,
                        },
                    }, ],
                },
            },
            {
                $unwind: {
                    path: "$forms",
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$forms",
                },
            },
        ]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `${DS}.examinations`,
        pipeline: [{
            $match: {
                org: "Denis",
            },
        }]
    },
    {
        source: "sparrow.H2-ACTOR",
        dest: `${DS}.actors`
    },
    {
        source: "sparrow.H2-ORGANIZATION",
        dest: `${DS}.organizations`
    },
    {
        source: "sparrow.H2-SEGMENTATION",
        dest: `${DS}.segmentations`
    }
]