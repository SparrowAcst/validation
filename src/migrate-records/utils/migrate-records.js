const mongodb = require("../../utils/mongodb")
const fs = require("fs")
const { exists, mkdir, unzip } = require("../../utils/file-system")
const path = require("path")
const s3bucket = require("../../utils/s3-bucket")
const filesize = require("file-size")
const uuid = require("uuid").v4
const { extension, lookup } = require("mime-types")
const { first, last } = require("lodash")
const AdmZip = require('adm-zip')
const detect = require('detect-file-type')

const CONFIG = require("../../../.config-migrate-db")

const FBStorage = require("../../utils/fb-storage")
const fb = new FBStorage(CONFIG.fb)

const db = CONFIG.mongodb.ade

const DEST = "ADE-RECORDS"
const TEMP_DIR = path.resolve("../temp")

const decodeFileType = file => new Promise((resolve, reject) => {

    detect.fromFile(file, (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result)
        }
    })

})

const delay = miliseconds => new Promise( resolve => {
    setTimeout(() => { resolve()}, miliseconds)
})

const migrateFB2S3 = async ({ id, fbpath }) => {

    let message = `...${last(id.split("-"))} >  `

    if (!id || !fbpath) {
        
        console.log(message+ "no data")
        
        return {
            error: "no data"
        }
    }

    try {
        
        const downloads = path.resolve(`${TEMP_DIR}/${id}`)
        let file = downloads
        
        await fb.downloadFile(fbpath, file)
        
        let type = await decodeFileType(file)
        console.log(type)
        await delay(1000)
        if (type.ext == "zip") {
            
            const zip = AdmZip(file, {});
            const zipEntries = zip.getEntries();
            zip.extractAllTo(TEMP_DIR, true, true, '');
            const entry = path.resolve(`${TEMP_DIR}/${zipEntries[0].entryName}`);
            type = await decodeFileType(entry)
            file = path.resolve(`${TEMP_DIR}/${id}.${type.ext}`)
            await fs.promises.rename(entry, file);
        } else {

            newFile = path.resolve(`${TEMP_DIR}/${id}.${type.ext}`)
            await fs.promises.rename(file, newFile);
            file = newFile
        }


        await s3bucket.uploadLt20M({
            source: file,
            target: `${DEST}/${id}.${type.ext}`
        })

        // await fs.promises.chmod(downloads, 0o775)
        // await fs.promises.chmod(file, 0o775)
        
        await fs.promises.unlink(downloads)
        await fs.promises.unlink(file)
        
        console.log(message + `S3: ${DEST}/${id}.${type.ext} - ok`)
            
        return {
            path: `${DEST}/${id}.${type.ext}`
        }

    } catch(e) {
        console.log(message + e.toString())
        return {
            error: e.toString()
        }
    }    
}

const execute = async COLLECTION => {



    console.log(`MIGRATE RECORDS FOR ${COLLECTION}`)
    
    const PAGE_SIZE = 2
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    process_records: {
                        $exists: false
                    }
                }
            },
            {
                '$limit': PAGE_SIZE
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]

        buffer = await mongodb.aggregate({
            db,
            collection: COLLECTION,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`${COLLECTION} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)

            if (buffer.length > 0) {

                for( let d of buffer){
                    d.process_records = await migrateFB2S3({
                        id: d.id,
                        fbpath: d.path
                    })
                }    

                let commands = buffer.map(d => ({
                    updateOne: {
                        filter: { "id": d.id },
                        update: {
                            $set:{
                              process_records: d.process_records  
                            }
                        },
                        upsert: true
                    }
                }))

                await mongodb.bulkWrite({
                    db,
                    collection: COLLECTION,
                    commands
                })

               
            }

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 && bufferCount < 1)

}


// const execute = async () => {
//     await migrateFB2S3({
//         id: "0589f7de-596a-4d7a-8063-b36c7e55388b",
//         fbpath: "9ASbG0DQawa2ajr0APjbqhVz8pG2/recordings/RNK_AhigRH5MYdhjhgK7NTl9"
//     })
// }

module.exports = execute