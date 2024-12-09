const execute = require("./utils/migrate")

const migrations = require("./migrations/test")

const run = async () => {
  await execute(migrations)
}

run()

