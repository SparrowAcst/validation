const execute = require("./utils/sync")

const COLLECTION = "strazhesko-part-1.examinations"

const run = async () => {
  await execute(COLLECTION)
}

run()

