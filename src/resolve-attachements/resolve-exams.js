// const yargs = require("yargs");

const collections = [
    "sparrow.clinic4-exam",
    "sparrow.H3-EXAMINATION",
    "sparrow.H2-EXAMINATION",
    "sparrow.digiscope-exams",
    "sparrow.examination",
    "sparrow.hha-examination",
    "sparrow.phisionet-exams",
    "sparrow.phonendo-exams",
    "sparrow.stethophone-app-exams",
    "sparrow.vinil-exams",
    "sparrow.vintage-exam",
    "sparrow.yoda-exams"
]

const run = async () => {

	const execute = await require("./utils/resolve-exams")()

    for (const collection of collections) {
        await execute(collection)
    }

}

run()