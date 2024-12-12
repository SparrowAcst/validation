module.exports = [

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "strazhesko-part-1-done.labels",
        dest: `strazhesko-part-1.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },


    {
        source: "strazhesko-part-1-done.examinations",
        dest: `strazhesko-part-1.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },



    ////////////////////////////////////////////////////////////////////////////////////


]