const {sortBy, findIndex} = require("lodash")

const pattern = {
	S1: ["S1", "S2"],
	S2: ["S2", "S1"]
}

const isSegmentable = pair => {
	let p = pattern[pair[0].type]
	let res =  pair.map( (pr,i) => pr.type == p[i]).reduce( (a,b) => a && b, true)
	return res
}

const fit = (a,b) => {
	a = a.slice(findIndex(a, d => d.start >=0 && d.type == b[0].type))
	const length = Math.min(a.length, b.length)
	const delta = a[0].start - b[0].start
	let res = []
	for( let i=0; i<length; i++){
		res.push({
			ref:a[i],
			seg:{
				type: b[i].type,
				start: b[i].start+delta
			}
		})
	} 

	return res
}


const fitSegmentations = options => {

	let ref = sortBy(options.reference.data, d => d.start)
	let seg = sortBy(options.segmentation.data, d => d.start)
	let res = fit(ref, seg)
	res = res.map( d => {
		let r = {}
		r[`${options.reference.name}_type`] = d.ref.type
		r[`${options.reference.name}_start`] = d.ref.start
		r[`${options.segmentation.name}_type`] = d.seg.type
		r[`${options.segmentation.name}_start`] = d.seg.start
		return r
	})

	return res

}

module.exports = {
	fitSegmentations	
}


