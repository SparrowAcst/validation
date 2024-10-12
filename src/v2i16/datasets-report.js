const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy, flatten, orderBy } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2spectrum = require("../utils/wav2spectrum")
const fs = require("fs")

const datasets = require("./datasets")


const run = async () => {

    let data = orderBy(
        flatten(
            datasets
            .map((d, i) => {
                return require(d.localMetadata).map(r => {
                    r.test = d.name
                    return r
                })
            })
        ).map(d => {
            d.file_created_at = moment(d.file_created_at).toDate()
            return d
        }), ["patient_id", "record_type", "record_spot", "record_body_side"]
    )

    await saveXLSX(
    	data, 
    	"./src/v2i16/xlsx/v2i16-datasets-report.xlsx",
    	"data",
    	[
    		"test",
    		"patient_id",
    		"record_type",
    		"record_spot",
    		"record_body_side",
    		"file_id",
    		"file_created_at"
    	] 
    )

    fs.writeFileSync("./src/v2i16/json/v2i16-datasets-report.json", JSON.stringify(data))


}

run()
