const { loadJSON } = require("./utils/file-system")


let data = loadJSON("./data/js-object/Stethophone_P01Segm_01.txt")

console.log(JSON.stringify(data))