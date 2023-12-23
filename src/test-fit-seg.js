const { loadJSON, loadText } = require("./utils/file-system")
const { fitSegmentations} = require("./utils/fit-segments")

let segmentation = loadJSON("./data/js-object/Stethophone_P01Segm_01.txt")

let ref = loadText("./data/js-object/Eko_P01Segm_01.txt")
ref = ref
		.split("\n")
		.map( d => {
			d = d.split(",").map( d => d.trim())
			d[0] = `"${d[0]}"`
			return `[${d.join(",")}]`
		})
ref = `ref = [${ref}]`
eval(ref)
ref = ref.filter(d => d.length > 1)
ref = ref.map( d => ({
			type: d[0],
			start: Number.parseFloat(d[1].toFixed(2))
		}))

let result = fitSegmentations({
	reference:{
		name: "eco",
		data: ref
	},
	segmentation:{
		name: "st",
		data: segmentation
	}
})

console.log(result)		