const execute = require("./utils/migrate-records")

const COLLECTION = "DEV-CLINIC-TEST.labels"

const run = async () => {
  await execute(COLLECTION)
}

run()
