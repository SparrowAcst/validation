const execute = require("../utils/migrate")

const migrations = require("./migrations/create-schemas")

const run = async () => {
  await execute(migrations)
}

run()
