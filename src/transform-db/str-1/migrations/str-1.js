module.exports = [{
        source: "sparrow.H2",
        dest: "str-1.labels",
        pipeline: [{
            $match: {
                Clinic: "STRAZHESKO"
            },
        }]
    },
    {
        source: "sparrow.H2-FORM",
        dest: "str-1.forms",
        pipeline: [{
                $match: {
                    org: "STRAZHESKO",
                },
            },
            {
                $lookup: {
                    from: "forms",
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
        dest: "str-1.examinations",
        pipeline: [{
            $match: {
                org: "STRAZHESKO",
            },
        }]
    },
    {
        source: "sparrow.H2-ACTOR",
        dest: "str-1.actors"
    },
    {
        source: "sparrow.H2-ORGANIZATION",
        dest: "str-1.organizations"
    },
    {
        source: "sparrow.H2-SEGMENTATION",
        dest: "str-1.segmentations"
    }
]