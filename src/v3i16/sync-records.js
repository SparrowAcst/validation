const axios = require("axios")

const SYNC_URL = {
    v3: "https://jvdpy2gp554utlbwmaenydk56m0pjtgn.lambda-url.eu-central-1.on.aws/",
    v2: "https://f2widtdjmjfyutl3aunyzv4tmu0kzwio.lambda-url.us-east-1.on.aws/"
}

const DATASETS = require("./datasets").map( d => d.sync).filter(d => d)

const syncRecords = async () => {

    console.log("Sync records", DATASETS.map(d => d.folder))

    for (let dataset of DATASETS.filter( d => d.stVersion == 3)) {
        console.log(dataset.stVersion, dataset.folder)
        let response = await axios.post(
            SYNC_URL.v3, {
                query: [dataset]
            }
        )

        console.log(response.data)

    }

    for (let dataset of DATASETS.filter( d => d.stVersion == 2)) {
        console.log(dataset.stVersion, dataset.folder)
        let response = await axios.post(
            SYNC_URL.v2, {
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

