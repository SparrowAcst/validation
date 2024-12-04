const mongodb = require("../../utils/mongodb")
const { first, last, groupBy } = require("lodash")

const db = require("../../../.config-migrate-db").mongodb.ade

const data = require("./test-ids.json").map(d => d.id)
const data1 = require("./train-ids.json").map(d => d.id)

const schemas = [
    "potashev-part-1",
    "denis-part-1",
    "yoda",
    "harvest1",
    "phonendo",
    "strazhesko-part-1",
    "poltava-part-1",
    "digiscope",
    "hha"
]

// node ./src/transform-db/stages/transform 8 10 100

const PREFIX = "-mix"


const run = async () => {

// console.log("TEST")

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [
            {
				$match:{
					id:{
						$in: data
					}
				}
				},
            {
                $group: {
                    _id: "$model",
                    count: {
                        $count: {},
                    },
                },
            }]
        })

        // console.log(`${schema} device`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }

//     for (const schema of schemas) {

//         let res = await mongodb.aggregate({
//             db,
//             collection: `${schema}${PREFIX}.labels`,
//             pipeline: [
//             {
// 				$match:{
// 					id:{
// 						$in: data
// 					}
// 				}
// 				},
//             {
//                 $group: {
//                     _id: "$examinationId",
//                     count: {
//                         $count: {},
//                     },
//                 },
//             }]
//         })

//         console.log(`${schema} patients`)
//         // res.forEach(r => {
//             console.log(`${schema} ${res.length}`)
//         // })

//     }

//     for (const schema of schemas) {

//         let res = await mongodb.aggregate({
//             db,
//             collection: `${schema}${PREFIX}.labels`,
//             pipeline: [
//             {
// 				$match:{
// 					id:{
// 						$in: data
// 					}
// 				}
// 				},
// 				{
//                 $group: {
//                     _id: "$Ethnicity",
//                     count: {
//                         $count: {},
//                     },
//                 },
//             }, ]
//         })

//         console.log(`${schema} Ethnicity`)
//         res.forEach(r => {
//             console.log(`${r._id} ${r.count}`)
//         })

//     }

//     for (const schema of schemas) {

//         let res = await mongodb.aggregate({
//             db,
//             collection: `${schema}${PREFIX}.labels`,
//             pipeline: [{
// 				$match:{
// 					id:{
// 						$in: data
// 					}
// 				}
// 				},
// 				{
//                 $group: {
//                     _id: "$Sex at Birth",
//                     count: {
//                         $count: {},
//                     },
//                 },
//             }, ]
//         })

//         console.log(`${schema} Sex`)
//         res.forEach(r => {
//             console.log(`${r._id} ${r.count}`)
//         })

//     }

//     for (const schema of schemas) {

//         let res = await mongodb.aggregate({
//             db,
//             collection: `${schema}${PREFIX}.labels`,
//             pipeline: [{
// 				$match:{
// 					id:{
// 						$in: data
// 					}
// 				}
// 				},{
//                 $group: {
//                     _id: "$Sex at Birth",
//                     count: {
//                         $count: {},
//                     },
//                 },
//             }, ]
//         })

//         console.log(`${schema} Sex`)
//         res.forEach(r => {
//             console.log(`${r._id} ${r.count}`)
//         })

//     }


////////////////////////////////////////////////////////////////////

console.log("TRAIN")

// for (const schema of schemas) {

    //     let res = await mongodb.aggregate({
    //         db,
    //         collection: `${schema}${PREFIX}.labels`,
    //         pipeline: [
    //         {
				// $match:{
				// 	id:{
				// 		$in: data1
				// 	}
				// }
				// },
    //         {
    //             $group: {
    //                 _id: "$model",
    //                 count: {
    //                     $count: {},
    //                 },
    //             },
    //         }]
    //     })

    //     console.log(`${schema} device`)
    //     res.forEach(r => {
    //         console.log(`${r._id} ${r.count}`)
    //     })

    // }

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [
            {
				$match:{
					id:{
						$in: data1
					}
				}
				},
            {
                $group: {
                    _id: "$Examination ID",
                    count: {
                        $count: {},
                    },
                },
            }]
        })

        // console.log(`${schema} patients`)
        // res.forEach(r => {
            console.log(`${schema} ${res.length}`)
        // })

    }

    // for (const schema of schemas) {

    //     let res = await mongodb.aggregate({
    //         db,
    //         collection: `${schema}${PREFIX}.labels`,
    //         pipeline: [
    //         {
				// $match:{
				// 	id:{
				// 		$in: data1
				// 	}
				// }
				// },
				// {
    //             $group: {
    //                 _id: "$Ethnicity",
    //                 count: {
    //                     $count: {},
    //                 },
    //             },
    //         }, ]
    //     })

    //     console.log(`${schema} Ethnicity`)
    //     res.forEach(r => {
    //         console.log(`${r._id} ${r.count}`)
    //     })

    // }

    // for (const schema of schemas) {

    //     let res = await mongodb.aggregate({
    //         db,
    //         collection: `${schema}${PREFIX}.labels`,
    //         pipeline: [{
				// $match:{
				// 	id:{
				// 		$in: data1
				// 	}
				// }
				// },
				// {
    //             $group: {
    //                 _id: "$Sex at Birth",
    //                 count: {
    //                     $count: {},
    //                 },
    //             },
    //         }, ]
    //     })

    //     console.log(`${schema} Sex`)
    //     res.forEach(r => {
    //         console.log(`${r._id} ${r.count}`)
    //     })

    // }

    // for (const schema of schemas) {

    //     let res = await mongodb.aggregate({
    //         db,
    //         collection: `${schema}${PREFIX}.labels`,
    //         pipeline: [{
				// $match:{
				// 	id:{
				// 		$in: data1
				// 	}
				// }
				// },{
    //             $group: {
    //                 _id: "$Sex at Birth",
    //                 count: {
    //                     $count: {},
    //                 },
    //             },
    //         }, ]
    //     })

    //     console.log(`${schema} Sex`)
    //     res.forEach(r => {
    //         console.log(`${r._id} ${r.count}`)
    //     })

    // }



}

run()