const execute = require("../utils/migrate")

const migrations = require("./migrations/hh3")

const run = async () => {
  await execute(migrations)
}

run()

