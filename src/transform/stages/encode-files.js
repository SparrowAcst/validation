const execute = require("../utils/migrate")

const migrations = require("./migrations/files")

const run = async () => {
  await execute(migrations)
}

run()

