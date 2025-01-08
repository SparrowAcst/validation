const fs = require("fs")
const path = require("path")
const s3bucket = require("../../utils/s3-bucket")
const filesize = require("file-size")
const uuid = require("uuid").v4
const { extension, lookup } = require("mime-types")
const { first, last, } = require("lodash")


const DEST = "TEMP-HEIC/"
const SOURCE = ""

const execute = async SCHEMA => {
    let src = require("./H3-HEIC.json")
    src = src.map( d => ({
        source: `${SOURCE}${d.path}`,
        target: `${DEST}${last(d.path.split("/"))}`
    }))   
    

    let i = 0
    
    for(let op of src){
        
        i++
        console.log(i, "from", src.length, op)
        
        await s3bucket.copyObjectV2({
            sourceKey: op.source,
            destinationKey: op.target
        })

    }

}

module.exports = execute 