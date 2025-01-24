const mongodb = require("../utils/mongodb")
const axios = require("axios")
const googledriveService = require("../utils/google-drive")
const { loadJSON, unlink, mkdir, rmdir, exists, saveJSON, unzip, getFileList } = require("../utils/file-system")
const fs = require("fs")
const path = require("path")
const s3bucket = require("../utils/s3-bucket")
const { first, last, extend } = require("lodash")

const db = require("../../.config-migrate-db").mongodb.ade

const DEST = "TRANSFER-FILES/SOURCE"

const TEMP_DIR = path.resolve("../../TEMP_TRANSFER")


const prepareFiles = async path => {
    let googleDrive = await googledriveService.create(path)
    return googleDrive
}


const downloadFile = (url, dest) => new Promise((resolve, reject) => {

    const writer = fs.createWriteStream(dest)

    axios({
        method: 'get',
        url,
        responseType: 'stream'
    }).then((response) => {
        response.data.pipe(writer);
    });

    writer.on('finish', () => {
        console.log('File downloaded successfully.');
        resolve()
    });

    writer.on('error', (err) => {
        console.error(err);
        reject()
    });


    // const res = await axios.get(url, { responseType: 'arraybuffer' })
    // const writer = fs.createWriteStream(dest)
    // const res = await axios.get(url, { responseType: "stream" })
    // res.data.pipe(writer)
    // writer.on('finish', () => {
    //   console.log('File downloaded successfully.');
    // });
    // writer.on('error', (err) => {
    //   console.error(err);
    // });    
    // fs.writeFileSync(dest, res.data);
})


const excludes = [
    // "ADE-ECHOS/f111d432-7430-4579-aba9-80c5433af4be.rar",
    // "ADE-ECHOS/75e1a390-58db-49b2-8eda-48e964698567.rar",
    // "ADE-ECHOS/14cb2b7e-2b0c-4764-a4f9-b2797f25d4a6.rar",
    // "ADE-ECHOS/93626dbd-12ef-488f-8d29-a26670f7b418.rar",
    // "ADE-ECHOS/0ff4ee30-6d30-428a-bd2f-91712a2d05a5.rar"
]

const transferFiles = async transfers => {

    let i = 0
    let result = []

    transfers = transfers.filter(t => !excludes.includes(t.from))

    for (const transfer of transfers) {
        try {

            if (!transfer.from) {
                result.push({
                    id: transfer.id,
                    transfer_complete: "data not found"
                })
                console.log("No data", transfer.id)
                continue
            }

            i++

            let tempFile = path.resolve(`${TEMP_DIR}/${path.basename(transfer.from)}`)
            let url = await s3bucket.getPresignedUrl(transfer.from)
            console.log(`\n\n${i} from ${transfers.length}\nDownload ${url} > ${tempFile}`)
            await downloadFile(url, tempFile)


            let destDrive = await prepareFiles(path.dirname(transfer.to))
            console.log(`\n\nUpload ${tempFile} > ${transfer.to}`)
            await destDrive.uploadFiles({
                fs: [tempFile],
                googleDrive: path.dirname(transfer.to)
            })

            await unlink(tempFile)

            result.push({
                id: transfer.id,
                transfer_complete: true
            })

        } catch (e) {
            console.log("\n TRANSFER ERROR: ", e.toString(), e.stack)
            result.push({
                id: transfer.id,
                transfer_complete: {
                    error: `${e.toString()} ${e.stack}`
                }
            })
        }
    }

    return result

}



const execute = async () => {

    if (!(await exists(`${TEMP_DIR}`))) {
        console.log(`Create dir ${TEMP_DIR}`)
        await mkdir(`${TEMP_DIR}`)
    }

    const PAGE_SIZE = 20
    let bufferCount = 0
    let skip = 0

    const pipeline = [{
            $match: {
                transfer_complete: {
                    $exists: false,
                },
            },
        },
        {
            $lookup: {
                from: "H2-FORM",
                localField: "id",
                foreignField: "examinationId",
                as: "attach",
                pipeline: [{
                        $match: {
                            type: "attachements",
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            attach: "$resolvedData",
                        },
                    },
                ],
            },
        },
        {
            $project: {
                id: "$id",
                org: "$org",
                attach: {
                    $first: "$attach.attach",
                },
            },
        },
        {
            $unwind: {
                path: "$attach",
            },
        },
        {
            $match: {
                "attach.url": {
                    $ne: "toUpload",
                },
            },
        },
        {
            $limit: 20,
        },
    ]
    // [

    //     {
    //         $match: {
    //             transfer_complete: {
    //                 $exists: false,
    //             },
    //         },
    //     },
    //     {
    //         $limit: PAGE_SIZE
    //     },
    //     {
    //         $lookup: {
    //             from: "H2-FORM",
    //             localField: "id",
    //             foreignField: "examinationId",
    //             as: "attach",
    //             pipeline: [{
    //                     $match: {
    //                         type: "attachements",
    //                     },
    //                 },
    //                 {
    //                     $project: {
    //                         _id: 0,
    //                         attach: "$resolvedData",
    //                     },
    //                 },
    //             ],
    //         },
    //     },
    //     {
    //         $project: {
    //             id: "$id",
    //             org: "$org",
    //             attach: {
    //                 $first: "$attach.attach",
    //             },
    //         },
    //     },
    //     {
    //         $unwind: {
    //             path: "$attach",
    //         },
    //     },
    // ]

    const type2folder = {
        "image": "IMAGE",
        "image/jpeg": "IMAGE",
        "application/vnd.rar": "RAR",
        "application/pdf": "PDF"
    }

    do {
        console.log("START")
        buffer = await mongodb.aggregate({
            db,
            collection: "sparrow.H2-EXAMINATION",
            pipeline
        })

        console.log(`Load buffer ${bufferCount + 1}: ${buffer.length} items`)

        if (buffer.length > 0) {

            let transfers = buffer.map(b => {

                if (b.attach && b.attach.mimeType && b.attach.name && b.attach.path) {
                    return {
                        id: b.id,
                        from: b.attach.path,
                        to: `${DEST}/${type2folder[b.attach.mimeType]}/${b.org}/${b.attach.name}`
                    }
                }
            }).filter(d => d)


            let result = await transferFiles(transfers)

            let commands = result.map(r => ({
                updateOne: {
                    filter: { id: r.id },
                    update: {
                        $set: {
                            transfer_complete: r.transfer_complete
                        }
                    },
                    upsert: true
                }
            }))

            if (commands.length > 0) {

                console.log(`Update buffer ${bufferCount + 1}: ${buffer.length} items`)

                await mongodb.bulkWrite({
                    db,
                    collection: "sparrow.H2-EXAMINATION",
                    commands
                })
            }

        }

        skip += buffer.length
        bufferCount++

    }
    while (buffer.length > 0)

}


execute()