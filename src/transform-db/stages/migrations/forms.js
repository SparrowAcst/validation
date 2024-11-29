module.exports = [

    /////////////////////////////////////////////////////////////////////////////

    // {
    //     source: "strazhesko-part-1.examinations",
    //     dest: `strazhesko-part-1.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "potashev-part-1.examinations",
    //     dest: `potashev-part-1.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },
    // {
    //     source: "denis-part-1.examinations",
    //     dest: `denis-part-1.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "poltava-part-1.examinations",
    //     dest: `poltava-part-1.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "yoda.examinations",
    //     dest: `yoda.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "phonendo.examinations",
    //     dest: `phonendo.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "digiscope.examinations",
    //     dest: `digiscope.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "hha.examinations",
    //     dest: `hha.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

    // {
    //     source: "harvest1.examinations",
    //     dest: `harvest1.examinations-upd`,
    //     pipeline: [{
    //             $lookup: {
    //                 from: "forms",
    //                 localField: "id",
    //                 foreignField: "examinationId",
    //                 as: "af",
    //                 pipeline: [{
    //                     $project: {
    //                         _id: 0,
    //                         type: 1,
    //                         data: 1,
    //                         resolvedData: 1,
    //                     },
    //                 }, ],
    //             },
    //         },
    //         {
    //             $set: {
    //                 forms: {},
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "patient"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.echo": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "echo"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.ekg": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: ["$$item.type", "ekg"],
    //                             },
    //                         },
    //                     },
    //                 },
    //                 "forms.attachements": {
    //                     $first: {
    //                         $filter: {
    //                             input: "$af",
    //                             as: "item",
    //                             cond: {
    //                                 $eq: [
    //                                     "$$item.type",
    //                                     "attachements",
    //                                 ],
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         {
    //             $set: {
    //                 "forms.patient.data": "$forms.patient.data.en",
    //                 "forms.echo.data": "$forms.echo.data.en",
    //                 "forms.ekg.data": "$forms.ekg.data.en",
    //             },
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //             },
    //         },
    //     ]
    // },

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////


	    /////////////////////////////////////////////////////////////////////////////

    {
        source: "strazhesko-part-1.examinations-upd",
        dest: `strazhesko-part-1.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },
    {
        source: "potashev-part-1.examinations-upd",
        dest: `potashev-part-1.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    }, 
    {
        source: "denis-part-1.examinations-upd",
        dest: `denis-part-1.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },
    {
        source: "poltava-part-1.examinations-upd",
        dest: `poltava-part-1.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },
    {
        source: "yoda.examinations-upd",
        dest: `yoda.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },

    {
        source: "phonendo.examinations-upd",
        dest: `phonendo.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },

    {
        source: "digiscope.examinations-upd",
        dest: `digiscope.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },

    {
        source: "hha.examinations-upd",
        dest: `hha.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },

    {
        source: "harvest1.examinations-upd",
        dest: `harvest1.examinations`,
        pipeline: [{
        	$project:{
        		_id: 0
        	}
        }]
    },


]