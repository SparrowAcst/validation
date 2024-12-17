const execute = require("./utils/sync")

const SCHEMA = "strazhesko-part-1"

const run = async () => {
  await execute(SCHEMA)
}

run()

