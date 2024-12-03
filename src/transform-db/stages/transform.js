const execute = require("../utils/interpreter")

const START_STAGE = Number.parseInt(process.argv[1] || 0)
const STOP_STAGE = Number.parseInt(process.argv[2] || 23)
const BUFFER_SIZE = Number.parseInt(process.argv[3] || 100)



const run = async () => {
  await execute(START_STAGE, STOP_STAGE, BUFFER_SIZE)
}

run()

