const execute = require("../utils/migrate")

const migrations = require("./migrations/forms")

const run = async () => {
  await execute(migrations)
}

run()

