const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.yoda"

const run = async () => {
  await execute(COLLECTION)
}

run()
