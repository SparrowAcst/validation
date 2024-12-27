const execute = require("./utils/migrate-records")

const COLLECTION = "wf-test.labels-upd"

const run = async () => {
  await execute(COLLECTION)
}

run()
