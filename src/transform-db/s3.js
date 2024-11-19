const yargs = require("yargs");
const s3bucket = require("../utils/s3-bucket")
const { sortBy } = require("lodash")
const filesize = require("file-size")

const settings = yargs.argv;





const getFileWriteStreamFromGD = async (drive, fileId) => {
    
    let stream = await drive.geFiletWriteStream({ id: fileId })
    return stream

}



const copyFromGD = async settings => {
    
    let { t, s, d, p } = settings

    if (d) {
        s3bucket.setBucket(d)
    }

    const googleDrive = await require("../utils/drive3")()
    const drive = await googleDrive.create()
    let stream = await getFileWriteStreamFromGD(drive, s)
    await s3bucket.uploadFromStream({
        stream,
        target: p,
        callback: progress => {
          process.stdout.write(`COPY ${filesize(progress.loaded).human("jedec")} from ${filesize(progress.total).human("jedec")} (${(100*progress.loaded/progress.total).toFixed(1)}%)`)
        }
    })


}


const copyFromFB = async settings => {
    
    let { t, s, p } = settings

}

const copyFromS3 = async settings => {
    
    let { t, s, p } = settings

}



const dir = async settings => {
    let { p, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    return (await s3bucket.dir(p))
}

const tree = async settings => {
    let { p, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    let res = await s3bucket.tree(p)
    res = sortBy(res.map(d => d.Prefix))
    return res
}

const copy = async settings => {
    let { s, t, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    await s3bucket.copy({
        source: s,
        target: t,
        callback: ({ sourceBucketAlias, sourceKey, destinationBucketAlias, destinationKey }) => {
            console.log(`${sourceBucketAlias}:${sourceKey} > ${destinationBucketAlias}:${destinationKey}`)
        }
    })
}

const upload = async settings => {
    let { s, t, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    await s3bucket.uploadFromURL({
            source: s,
            target: t,
            callback: (progress) => {
              process.stdout.write(`UPLOAD ${filesize(progress.loaded).human("jedec")} from ${filesize(progress.total).human("jedec")} (${(100*progress.loaded/progress.total).toFixed(1)}%)`)
            }
        }
    )
}

const deleteFiles = async settings => {
    let { p, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    return (await s3bucket.deleteFiles(p))
}


const list = async settings => {
    let { p, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    return (await s3bucket.list(p))
}

const metadata = async settings => {
    let { p, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    return (await s3bucket.metadata(p))
}

const download = async settings => {
    let { s, t, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    return (await s3bucket.download({
        source: s,
        target: t
    }))
}



const url = async settings => {
    let { p, d } = settings
    if (d) {
        s3bucket.setBucket(d)
    }
    return (await s3bucket.getPresignedUrl(p))
}




const run = async () => {

    if (settings.transfer || settings.migrate) {
        console.log("Transfer data: ", settings.t, settings.d || "default", settings.s, settings.p)
        if(settings.t == "GD"){
            console.log((await copyFromGD(settings)))    
            return
        }
        if(settings.t == "FB"){
            console.log((await copyFromFB(settings)))    
            return
        }
        if(settings.t == "S3"){
            console.log((await copyFromFB(settings)))    
            return
        }
 
        return
    }



    if (settings.list) {
        console.log("List S3 bucket: ", settings.d || "default", settings.p)
        console.log((await list(settings)))
        return
    }

    if (settings.metadata) {
        console.log("S3 bucket metadata: ", settings.d || "default", settings.p)
        console.log((await metadata(settings)))
        return
    }

    if (settings.info) {
        console.log("S3 bucket info: ", settings.d || "default", settings.p)
        console.log((await metadata(settings)))
        return
    }

    if (settings.dir) {
        console.log("S3 bucket dir: ", settings.d || "default", settings.p)
        console.log((await dir(settings)))
        return
    }

    if (settings.tree) {
        console.log("S3 bucket tree: ", settings.d || "default", settings.p)
        console.log((await tree(settings)))
        return
    }

    // if(settings.delete){
    //   console.log("S3 bucket delete: ", settings.p)
    //   if(!settings.p) {
    //     console.log("Path required")
    //     return
    //   }
    //   console.log((await deleteFiles(settings)))
    //   return
    // }

    if (settings.download) {
        console.log("S3 bucket download: ", settings.d || "default", settings.s, settings.t)
        console.log((await download(settings)))
        return
    }

    if (settings.url) {
        console.log("S3 bucket url: ", settings.d || "default", settings.p)
        console.log((await url(settings)))
        return
    }

    if (settings.copy) {
        console.log("S3 bucket copy: ", settings.d || "default", settings.s, settings.t)
        await copy(settings)
        return
    }

    if (settings.upload) {
        console.log("S3 bucket upload: ", settings.d || "default", settings.s, settings.t)
        await upload(settings)
        return
    }


}

run()