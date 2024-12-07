module.exports = [

    // {
    //     source: "sparrow.yoda-exams",
    //     dest: `ADE-ENCODING.yoda-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.vintage-exam",
    //     dest: `ADE-ENCODING.vintage-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.vinil-exams",
    //     dest: `ADE-ENCODING.vinil-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.stethophone-app-exams",
    //     dest: `ADE-ENCODING.stethophone-app-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.phonendo-exams",
    //     dest: `ADE-ENCODING.phonendo-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.phisionet-exams",
    //     dest: `ADE-ENCODING.phisionet-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.hha-examination",
    //     dest: `ADE-ENCODING.hha-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.digiscope-exams",
    //     dest: `ADE-ENCODING.digiscope-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.examination",
    //     dest: `ADE-ENCODING.hh1-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    // {
    //     source: "sparrow.clinic4-exam",
    //     dest: `ADE-ENCODING.clinic4-examinations`,
    //     pipeline: [{
    //         $project: {
    //             _id: 0,
    //             id: "$uuid",
    //             patientId: 1
    //         }
    //     }]
    // },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.strazhesko-part-1-examinations`,
        pipeline: [{
                $match: {
                    siteId:"c42ac1bd-ae37-4a47-b431-44cf4d886be1"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.potashev-part-1-examinations`,
        pipeline: [{
                $match: {
                    siteId:"2031ce83-3eef-4c0d-8e01-192f47146a99"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.denis-part-1-examinations`,
        pipeline: [{
                $match: {
                    siteId:"9a5f35a0-f1ba-4b68-96e6-582cd12a7523"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.poltava-part-1-examinations`,
        pipeline: [{
                $match: {
                    siteId:"c74f57b8-6106-4ee7-b4ff-c13a14ca8791"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    }

]