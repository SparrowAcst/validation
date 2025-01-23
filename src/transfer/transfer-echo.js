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


const transferFiles = async transfers => {

    for(const transfer of transfers){

        let tempFile = path.resolve(`${TEMP_DIR}/${path.basename(transfer.from)}`)

        let url = await s3bucket.getPresignedUrl(transfer.from)

        console.log(`Download ${url} > ${tempFile}`)
        
        await downloadFile(url, tempFile)

        // await s3bucket.download({
        //     source: transfer.from,
        //     target: tempFile
        // })

        console.log(`Prepare ${path.dirname(transfer.to)}`)
        
        let destDrive = await prepareFiles(path.dirname(transfer.to))
        console.log(destDrive.fileList())

        console.log(`Upload ${tempFile} > ${transfer.to}`)
        await destDrive.uploadFiles({
            fs: [tempFile],
            googleDrive: path.dirname(transfer.to)
        })

        await unlink(tempFile)    
    
    }

}



const execute = async () => {

    if(!(await exists(`${TEMP_DIR}`))){
        console.log(`Create dir ${TEMP_DIR}`)
        await mkdir(`${TEMP_DIR}`)  
    }




    const PAGE_SIZE = 1
    let bufferCount = 0
    let skip = 0

    const pipeline = [{
            $match: {
                type: "echo",
                transfer: {
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
                dataPath: "$data.en.resolvedData.dataPath",
                machine: "$data.en.echocardiographic_machine",
            },
        },

    ]

    do {
        console.log(pipeline)
        buffer = await mongodb.aggregate({
            db,
            collection: "sparrow.H2-FORM",
            pipeline
        })
        console.log(buffer)

        if(buffer.length > 0){
            
            let transfers = buffer.map( b => ({
                from: b.dataPath,
                to: `${DEST}/${b.machine}/${path.basename(b.dataPath)}`
            }))
    
            console.log(transfers)

            await transferFiles(transfers)

            // await mongodb.updateMany({
            //     db,
            //     collection: SOURCE,
            //     filter: { "id": { $in: buffer.map(d => d.id) } },
            //     data: {
            //         process_echo: true
            //     }
            // })


        }
        
        

        skip += buffer.length
        bufferCount++

    } 
    while (buffer.length > 0 && bufferCount < 1)

}


execute()