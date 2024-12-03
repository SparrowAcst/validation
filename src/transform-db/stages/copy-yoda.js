const execute = require("../utils/migrate")

const migrations = require("./migrations/copy-yoda")

const run = async () => {
  await execute(migrations)
}

run()

