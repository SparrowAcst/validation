const axios = require("axios")

const SYNC_URL = "https://jvdpy2gp554utlbwmaenydk56m0pjtgn.lambda-url.eu-central-1.on.aws/"

const DATASETS = require("./datasets").map( d => d.sync)

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

