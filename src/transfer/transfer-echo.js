const mongodb = require("../utils/mongodb")
const axios = require("axios")
const googledriveService = require("../utils/google-drive")
const { loadJSON, unlink, mkdir, rmdir, exists, saveJSON, unzip, getFileList } = require("../utils/file-system")
const fs = require("fs")
const path = require("path")
const s3bucket = require("../utils/s3-bucket")
const { first, last, extend } = require("lodash")

const db = require("../../.config-migrate-db").mongodb.ade

const DEST = "TRANSFER-FILES/SOURCE/ECHO"

const TEMP_DIR = path.resolve("../../TEMP_TRANSFER")


const prepareFiles = async path => {
    let googleDrive = await googledriveService.create(path)
    return googleDrive   
}


const downloadFile = async (url, dest) => {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(dest, res.data);
} 


const excludes = [
    "ADE-ECHOS/f111d432-7430-4579-aba9-80c5433af4be.rar"
]

const transferFiles = async transfers => {

    let i = 0
    let result = []

    transfers = transfers.filter( t => !excludes.includes(t.from))

    for(const transfer of transfers){
        try {
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

        } catch(e) {
            console.log("\n TRANSFER ERROR: ",e.toString(), e.stack)
            result.push({
                id: transfer.id,
                transfer_complete: {
                    error: `${e.toString()} ${e.stack}` 
                }
            })
        }        
        
        return result
    }

}



const execute = async () => {

    if(!(await exists(`${TEMP_DIR}`))){
        console.log(`Create dir ${TEMP_DIR}`)
        await mkdir(`${TEMP_DIR}`)  
    }

    const PAGE_SIZE = 20
    let bufferCount = 0
    let skip = 0

    const pipeline = [{
            $match: {
                type: "echo",
                transfer_complete: {
                    $exists: false,
                },
            },
        },
        {
            $limit: PAGE_SIZE   
        },
        {
            $project: {
                _id: 0,
                id: 1,
                dataPath: "$data.en.resolvedData.dataPath",
                machine: "$data.en.echocardiographic_machine",
            },
        },

    ]



    do {
        
        buffer = await mongodb.aggregate({
            db,
            collection: "sparrow.H2-FORM",
            pipeline
        })
        
        console.log(`Load buffer ${bufferCount + 1}: ${buffer.length} items`)

        if(buffer.length > 0){
            
            let transfers = buffer.map( b => ({
                id: b.id,
                from: b.dataPath,
                to: `${DEST}/${b.machine}/${path.basename(b.dataPath)}`
            }))
    
            let result = await transferFiles(transfers)

            let commands = result.map( r => ({
                updateOne:{
                    filter: {id: r.id},
                    update: {
                        $set:{
                            transfer_complete: r.transfer_complete
                        }
                    },
                    upsert: true
                }
            }))

            if(commands.length > 0){

                console.log(`Update buffer ${bufferCount + 1}: ${buffer.length} items`)

                await mongodb.bulkWrite({
                    db,
                    collection: "sparrow.H2-FORM",
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