const execute = require("../utils/migrate-files")

const SCHEMA = "HH1"

const run = async () => {
  await execute(SCHEMA)
}

run()
