const execute = require("./utils/sync")

const COLLECTION = "strazhesko-part-1.labels"

const run = async () => {
  await execute(COLLECTION)
}

run()

