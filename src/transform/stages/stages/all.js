module.exports = [{
        collection: "labels",
        command: "aggregate",
        pipeline: [{
                $set: {
                    id: {
                        $function: {
                            body: `function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            }`,
                            args: [],
                            lang: "js",
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    ais: 0,
                },
            },
            {
                $out: "labels-stage-1",
            },
        ]
    },

    {
        dataset: d => !["digiscope", "phonendo"].includes(d),
        collection: "examinations",
        command: "aggregate",
        pipeline: [{
                $lookup: {
                    from: "forms",
                    localField: "patientId",
                    foreignField: "patientId",
                    as: "af",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            type: 1,
                            data: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    forms: {},
                },
            },
            {
                $set: {
                    NEW_ID: {
                        $function: {
                            body: `function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            }`,
                            args: [],
                            lang: "js",
                        },
                    },
                    createdAt: {
                        $dateFromString: {
                            dateString: "$dateTime",
                        },
                    },
                    organizationId: "$organization",
                    "forms.patient": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: ["$$item.type", "patient"],
                                },
                            },
                        },
                    },
                    "forms.echo": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: ["$$item.type", "echo"],
                                },
                            },
                        },
                    },
                    "forms.ekg": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: ["$$item.type", "ekg"],
                                },
                            },
                        },
                    },
                    "forms.attachements": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: [
                                        "$$item.type",
                                        "attachements",
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $set: {
                    "forms.patient.data": "$forms.patient.data.en",
                    "forms.echo.data": "$forms.echo.data.en",
                    "forms.ekg.data": "$forms.ekg.data.en",
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    NEW_ID: 1,
                    patientId: 1,
                    organizationId: 1,
                    userId: 1,
                    state: 1,
                    createdAt: 1,
                    synchronizedAt: 1,
                    updatedAt: 1,
                    updatedBy: 1,
                    forms: 1
                },
            },
            {
                $out: "examination-stage-1",
            },
        ]
    },

    {
        dataset: d => ["digiscope", "phonendo"].includes(d),
        collection: "examinations",
        command: "aggregate",
        pipeline: [{
                $lookup: {
                    from: "forms",
                    localField: "id",
                    foreignField: "examinationId",
                    as: "af",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            type: 1,
                            data: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    forms: {},
                },
            },
            {
                $set: {
                    NEW_ID: {
                        $function: {
                            body: `function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            }`,
                            args: [],
                            lang: "js",
                        },
                    },
                    createdAt: {
                        $dateFromString: {
                            dateString: "$dateTime",
                        },
                    },
                    organizationId: "$organization",
                    "forms.patient": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: ["$$item.type", "patient"],
                                },
                            },
                        },
                    },
                    "forms.echo": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: ["$$item.type", "echo"],
                                },
                            },
                        },
                    },
                    "forms.ekg": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: ["$$item.type", "ekg"],
                                },
                            },
                        },
                    },
                    "forms.attachements": {
                        $first: {
                            $filter: {
                                input: "$af",
                                as: "item",
                                cond: {
                                    $eq: [
                                        "$$item.type",
                                        "attachements",
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $set: {
                    "forms.patient.data": "$forms.patient.data.en",
                    "forms.echo.data": "$forms.echo.data.en",
                    "forms.ekg.data": "$forms.ekg.data.en",
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    NEW_ID: 1,
                    patientId: 1,
                    organizationId: 1,
                    userId: 1,
                    state: 1,
                    createdAt: 1,
                    synchronizedAt: 1,
                    updatedAt: 1,
                    updatedBy: 1,
                    forms: 1
                },
            },
            {
                $out: "examination-stage-1",
            },
        ]
    },

    {
        collection: "organizations",
        command: "aggregate",
        pipeline: [{
                $set: {
                    NEW_ID: {
                        $function: {
                            body: `function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            }`,
                            args: [],
                            lang: "js",
                        },
                    },
                },
            },
            {
                $out: "organizations-final",
            },
        ]
    },
    {
        collection: "actors",
        command: "aggregate",
        pipeline: [{
                $set: {
                    NEW_ID: {
                        $function: {
                            body: `function() {
                                return UUID()
                                    .toString()
                                    .split('"')[1];
                            }`,
                            args: [],
                            lang: "js",
                        },
                    },
                },
            },
            {
                $out: "actors-final",
            },
        ]
    },
    {
        collection: "examination-stage-1",
        command: "aggregate",
        pipeline: [{
                $lookup: {
                    from: "organizations-final",
                    localField: "organizationId",
                    foreignField: "id",
                    as: "org",
                },
            },
            {
                $lookup: {
                    from: "actors-final",
                    localField: "userId",
                    foreignField: "id",
                    as: "user",
                },
            },
            {
                $set: {
                    organizationId: {
                        $first: "$org",
                    },
                    user: {
                        $first: "$user",
                    },
                },
            },
            {
                $set: {
                    organizationId: "$organizationId.NEW_ID",
                    userId: "$user.NEW_ID",
                },
            },
            {
                $project: {
                    _id: 0,
                    org: 0,
                    user: 0,
                },
            },
            {
                $out: "examination-stage-2",
            },
        ]
    },
    {
        command: "drop",
        collection: "examination-stage-1"
    },
    {
        collection: "labels-stage-1",
        command: "aggregate",
        pipeline: [{
                $lookup: {
                    from: "examination-stage-2",
                    localField: "Examination ID",
                    foreignField: "patientId",
                    as: "e",
                },
            },
            {
                $addFields: {
                    examination: {
                        $first: "$e",
                    },
                },
            },
            {
                $addFields: {
                    examinationId: "$examination.NEW_ID",
                    Clinic: "$examination.organizationId",
                },
            },
            {
                $project: {
                    _id: 0,
                    "Segmentation URL": 0,
                    Source: 0,
                    "Examination ID": 0,
                    SOUND_FILE_EXISTS: 0,
                    e: 0,
                    examination: 0,
                    UPDATE_FB_SEG: 0,
                },
            },
            {
                $out: "labels-stage-2",
            },
        ]
    },
    {
        command: "drop",
        collection: "labels-stage-1"
    },

    {
        command: "aggregate",
        collection: "labels-stage-2",
        pipeline: [{
                $addFields: {
                    seg: {
                        id: {
                            $function: {
                                body: `function() {
                                    return UUID()
                                        .toString()
                                        .split('"')[1];
                                }`,
                                args: [],
                                lang: "js",
                            },
                        },
                        recordId: "$id",
                        examinationId: "$examinationId",
                        data: "$segmentation",
                    },
                },
            },
            {
                $set: {
                    segmentation: "$seg.id",
                },
            },
            {
                $out: "labels-stage-3",
            },
        ]
    },

    {
        command: "drop",
        collection: "labels-stage-2"
    },



    {
        collection: "examination-stage-2",
        command: "aggregate",
        pipeline: [{
                $project: {
                    _id: 0,
                    id: "$NEW_ID",
                    clinicalId: "$patientId",
                },
            },
            {
                $out: "patients",
            },
        ]
    },

    {
        collection: "labels-stage-3",
        command: "aggregate",
        pipeline: [{
                $project: {
                    _id: 0,
                    id: 1,
                    path: 1,
                },
            },
            {
                $out: "pathes",
            },
        ]
    },

    {
        collection: "labels-stage-3",
        command: "aggregate",
        pipeline: [{
                $replaceRoot: {
                    newRoot: "$seg",
                },
            },
            {
                $project: {
                    _id: 0,
                    data: 1,
                    id: 1,
                },
            },
            {
                $out: "seg-part",
            },
        ]
    },



    {
        collection: "segmentations",
        command: "aggregate",
        pipeline: [{
                $project: {
                    _id: 0,
                    id: 1,
                    data: 1,
                    user: 1,
                },
            },
            {
                $unionWith: {
                    coll: "seg-part",
                },
            },
            {
                $out: "segmentations-done"
            }
        ]
    },

    {
        command: "drop",
        collection: "seg-part"
    },

    {
        collection: "actors-final",
        command: "aggregate",
        pipeline: [{
                $lookup: {
                    from: "organizations-final",
                    localField: "organization",
                    foreignField: "id",
                    as: "o",
                },
            },
            {
                $set: {
                    o: {
                        $first: "$o",
                    },
                },
            },
            {
                $set: {
                    organizationId: "$o.NEW_ID",
                    id: "$NEW_ID",
                },
            },
            {
                $project: {
                    _id: 0,
                    userId: 0,
                    organization: 0,
                    patientIdCounter: 0,
                    NEW_ID: 0,
                    o: 0,
                },
            },
            {
                $out: "actors-done",
            },
        ]
    },
    {
        command: "drop",
        collection: "actors-final"
    },
    {
        collection: "organizations-final",
        command: "aggregate",
        pipeline: [{
                $project: {
                    _id: 0,
                    id: "$NEW_ID",
                    country: 1,
                    name: 1,
                },
            },
            {
                $out: "organizations-done",
            },
        ]
    },
    {
        command: "drop",
        collection: "organizations-final"
    },

    {
        collection: "examination-stage-2",
        command: "aggregate",
        pipeline: [{
                $set: {
                    id: "$NEW_ID",
                },
            },
            {
                $project: {
                    _id: 0,
                    patientId: 0,
                    NEW_ID: 0,
                },
            },
            {
                $out: "examinations-done",
            },
        ]

    },
    {
        command: "drop",
        collection: "examination-stage-2"
    },
    {
        collection: "labels-stage-3",
        command: "aggregate",
        pipeline: [{
                $set: {
                    organizationId: "$Clinic",
                },
            },
            {
                $project: {
                    _id: 0,
                    path: 0,
                    supd: 0,
                    Clinic: 0, 
                    seg: 0
                },
            },
            {
                $out: "labels-done",
            },
        ]

    },
    {
        command: "drop",
        collection: "labels-stage-3"
    },

]
