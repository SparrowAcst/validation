const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.phisionet"

const run = async () => {
  await execute(COLLECTION)
}

run()
