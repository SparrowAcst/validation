const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.harvest1-upd"

const run = async () => {
  await execute(COLLECTION)
}

run()
