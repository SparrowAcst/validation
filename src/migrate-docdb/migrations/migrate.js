const sanitizePipeline = require("../utils/sanitize-pipelines")


const SOURCE_SCHEMA = "sparrow"

module.exports = schema => {

    let pipelines = sanitizePipeline(schema.source)

    let labelPipeline = pipelines.labels

    if (schema.source.segmentationCollection) {
        labelPipeline = labelPipeline.concat([{
                $lookup: {
                    from: schema.source.segmentationCollection,
                    localField: "aiSegmentation",
                    foreignField: "id",
                    as: "result",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            data: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    aiSegmentation: {
                        $first: "$result.data",
                    },
                },
            },
            {
                $project: {
                    result: 0,
                },
            },
        ])
    }

    let examinationPipeline = pipelines.examinations
    examinationPipeline.push({
        $project: {
            _id: 0,
            patientId: 0
        }
    })



    return [

        /////////////////////////////////////////////////////////////////////////////

        {
            source: `${SOURCE_SCHEMA}.${schema.source.label_collection}`,
            dest: `${schema.target}.labels`,
            pipeline: (schema.source.label_pipeline || []).concat(labelPipeline)
        },


        {
            source: `${SOURCE_SCHEMA}.${schema.source.patientCollection}`,
            dest: `${schema.target}.examinations`,
            pipeline: (schema.source.patient_pipeline || []).concat(examinationPipeline)
        },
    ]
    ////////////////////////////////////////////////////////////////////////////////////


}