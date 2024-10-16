const axios = require("axios")

// const SYNC_URL_V3 = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
// // const DATASETS_V3 = require("../json/import-v3")

// const SYNC_URL_V2 = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
// // const DATASETS_V2 = require("../json/import-v2")


const SYNC_URL = "https://f2widtdjmjfyutl3aunyzv4tmu0kzwio.lambda-url.us-east-1.on.aws/"

const DATASETS = require("./datasets").map( d => d.sync).filter(d => d)

const syncRecords = async () => {

    console.log("Sync records", DATASETS.map(d => d.folder))

    for (let dataset of DATASETS) {
        console.log(dataset.folder)
        let response = await axios.post(
            SYNC_URL, {
                query: [dataset]
            }
        )

        console.log(response.data)

    }

}


const run = async () => {

    await syncRecords()


}




run()