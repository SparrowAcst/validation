const {sortBy, findIndex, find, last, isUndefined} = require("lodash")
const { min, anomalies } = require("./stat")

const minIndex = a => {
	let v = min(a)
	return findIndex(a, d => d == v)
}

const minItem = a => {
	let v = min(a.map(d => d.delta))
	return find(a, d => d.delta == v)	
}

const buildSections = segments => {
	let res = []
	let buf = []
	segments.forEach( (s, i) => {
		buf.push(s)
		if(s.type == 'unsegmentable'){
			res.push(buf)
			buf = []
		}
	})
	res.push(buf)
	return res.filter( s => s.length > 0)
}




const labeling = result => {

	for(let i = result.length-3; i >= 0 && (result[i].seg.fit == result[i+2].seg.fit || result[i+1].seg.fit == result[i+2].seg.fit); i--){
		if(result[i].seg.fit == result[i+2].seg.fit)
		result[i+2].ignore = "ignore"
	}


	for(let i = 0; i < result.length; i++){
		if(result[i].seg.type == 'unsegmentable'){
			result[i].ignore = "ignore"
			if(result[i-1]){
				result[i-1].ignore = "ignore"
			}
			if(result[i+1]){
				result[i+1].ignore = "ignore"
			}
		}

	}

	let anml = anomalies(result.filter(d => !d.ignore).map( d => Math.abs(d.ref.fit-d.seg.fit)))
	
	anml.forEach( anm => {
		if(anm.value > 0.16){
			result[anm.index].anomaly = "anomaly"
		}
	})

	return result
}



const fit = (a,b) => {

	const norm = (p,t) => {
		if(p.length != t.length) return Infinity
		c = 0
		for(let i=0; i<p.length-1; i++){
			if(p[i].type != t[i].type) return Infinity
			c += Math.abs((p[i+1].start-p[i].start) - (t[i+1].start-t[i].start))	
		}
		if(last(p).type != last(t).type) return Infinity
		return c	
	}



	const getStartIndex = (section, win) => {
		if(section.length == 0) return -1
		let b = section
		let pattern = b //.slice(0,3)
		pattern.shift()
		while( 
			pattern[pattern.length-2].type == last(pattern).type
			||
			pattern.map( p => p.type).includes('unsegmentable') 
			|| 
			!last(pattern)
		) pattern.pop()
		
		if(pattern.length < 2) return

		let points = []
		let timeline = a.slice(0, pattern.length)
		
		if( pattern.length >  timeline.length){
			pattern = pattern.slice(0, timeline.length - 5)
			timeline = a.slice(0, pattern.length)
		}

		for(let i=0; timeline.length == pattern.length && i < 12; i++){
			timeline = a.slice(i, pattern.length+i)
			points.push(norm(pattern,timeline))
		}
		//console.log("points", points)
		return minIndex(points)
	}




	let res = []
	let result = []

	let sections = buildSections(b)

	sections.forEach( (section, index) => {
		
		//console.log("section", index)
		//console.log("section.length", section.length)

		let fittedSection = []

		if(section.length < 2) return
		while( section.map( p => p.type).includes('unsegmentable') || !last(section)) section.pop()
		
		//console.log("section.length", section.length)

		if(section.length < 4) return

		//console.log("FIT")	
		let win = 4
		let startIndex = getStartIndex(section, win)
		
		//console.log("startIndex", startIndex)
		if(startIndex < 0 || startIndex == Infinity) return
		//console.log("section", section)
		//console.log("a", a)
		
		a.splice(0,startIndex)
		a_data = a.splice(0, section.length)	
		//console.log("a_data", a_data)
		
		let ad = a_data[0].start
		let bd = section[0].start

		a_data = a_data.map( d => {
			d.fit = d.start - ad
			return d
		}).filter( d => d.fit >= 0)
		
		section = section.map( d => {
			d.fit = d.start - bd
			return d
		}).filter( d => d.fit >= 0)

		a_data.forEach( (d,i) => {
			// //console.log(
			// 	d.type,
			// 	"\t",
			// 	d.start,
			// 	"\t",
			// 	d.fit,
			// 	"\t",
			// 	(b[i]) ? b[i].type : "",
			// 	"\t",
			// 	(b[i]) ? b[i].start : "",
			// 	"\t",
			// 	(b[i]) ? b[i].fit : ""
			// )

			let pool = {
				s1: section
						.filter( item => ["s1", "unsegmentable"].includes(item.type) )
						.map( item => {
							item.delta = Math.abs(item.fit - d.fit)
							return item
						}),
				s2: section
						.filter( item => ["s2", "unsegmentable"].includes(item.type))
						.map( item => {
							item.delta = Math.abs(item.fit - d.fit)
							return item
						})
			}

			fittedSection.push({
				section: index,
				ref: d,
				seg: minItem(pool[d.type])
			})
		})
		
		result = result.concat(labeling(fittedSection))
		
	})

	return result
}	


// 	//console.log("sections", sections)

	

// 	for(let i=0; i<sections.length; i++){
		
// 		let ptr = sections[i] 
		
// 		if(ptr.length < 2){
// 			fitSection = []
// 			break
// 		}

// 		while( ptr.map( p => p.type).includes('unsegmentable') || !last(ptr)) ptr.pop()
// 		if(ptr.length > 2){
// 			fitSection = ptr
// 			break
// 		}	
// 	}

// 	//console.log("fitSection", fitSection)

// 	let win = 4
// 	let startIndex = getStartIndex(fitSection, win)

// 	if(startIndex >= 0){
	
// 		let ad = a[startIndex].start
// 		let bd = fitSection[0].start

// 		a = a.map( d => {
// 			d.fit = d.start - ad
// 			return d
// 		}).filter( d => d.fit >= 0)
		
// 		b = b.map( d => {
// 			d.fit = d.start - bd
// 			return d
// 		}).filter( d => d.fit >= 0)

// 		a.forEach( (d,i) =>{
// 			// //console.log(
// 			// 	d.type,
// 			// 	"\t",
// 			// 	d.start,
// 			// 	"\t",
// 			// 	d.fit,
// 			// 	"\t",
// 			// 	(b[i]) ? b[i].type : "",
// 			// 	"\t",
// 			// 	(b[i]) ? b[i].start : "",
// 			// 	"\t",
// 			// 	(b[i]) ? b[i].fit : ""
// 			// )

// 			let pool = {
// 				s1: b.filter( item => ["s1", "unsegmentable"].includes(item.type) ).map( item => {
// 					item.delta = Math.abs(item.fit - d.fit)
// 					return item
// 				}),
// 				s2: b.filter( item => ["s2", "unsegmentable"].includes(item.type)).map( item => {
// 					item.delta = Math.abs(item.fit - d.fit)
// 					return item
// 				})
// 			}

// 			result.push({
// 				ref: d,
// 				seg: minItem(pool[d.type])
// 			})
// 		})
// 	}	

	
	
// 	return result

	
// }



const fitSegmentations = options => {

	let ref = sortBy(options.reference.data, d => d.start)
	let seg = sortBy(options.segmentation.data, d => d.start)
	let res = fit(ref, seg)
	res = res.map( d => {
		let r = {}
		
		r[`${options.reference.name}_type`] = d.ref.type
		r[`${options.reference.name}_start`] = d.ref.start
		r[`${options.reference.name}_fit`] = d.ref.fit
		
		r[`${options.segmentation.name}_type`] = d.seg.type
		r[`${options.segmentation.name}_start`] = d.seg.start
		r[`${options.segmentation.name}_fit`] = d.seg.fit
		
		r.ignore = d.ignore
		r.anomaly = d.anomaly
		r.section = d.section
		return r
	})

	return res

}

module.exports = {
	fitSegmentations	
}


