module.exports = [{
        source: "sparrow.H2",
        dest: "DS-STR-1.labels",
        pipeline: [{
            $match: {
                Clinic: "STRAZHESKO"
            },
        }]
    },
    {
        source: "sparrow.H2-FORM",
        dest: "DS-STR-1.forms",
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
        dest: "DS-STR-1.examinations",
        pipeline: [{
            $match: {
                org: "STRAZHESKO",
            },
        }]
    },
    {
        source: "sparrow.H2-ACTOR",
        dest: "DS-STR-1.actors"
    },
    {
        source: "sparrow.H2-ORGANIZATION",
        dest: "DS-STR-1.organizations"
    },
    {
        source: "sparrow.H2-SEGMENTATION",
        dest: "DS-STR-1.segmentations"
    }
]