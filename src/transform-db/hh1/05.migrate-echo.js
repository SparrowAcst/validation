const execute = require("../utils/migrate-echo")

const SCHEMA = "HH1"

const run = async () => {
  await execute(SCHEMA)
}

run()

