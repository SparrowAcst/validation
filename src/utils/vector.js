const { reduce, isUndefined, findIndex } = require("lodash")
const STAT = require("./stat")



let sum = data => reduce(data, (d,s) => d+s, 0)

let normEuclide = vector => {
	vector = vector.map( d => d*d)
	return Math.sqrt(sum(vector))
}

let normalize = (vector, normFunc) => {
	const norm = normFunc(vector)
	return vector.map( d => d/norm)
}

let scalarProd = (v1,v2) => {
	const length = Math.min(v1.length, v2.length)
	let tmp = []
	for(let i=0; i < length; i++) tmp.push(v1[i]*v2[i])
	return sum(tmp) 
}

let centroid = vectorSet => {
	let res = []
	for (let i=0; i < vectorSet[0].length; i++){
		res.push(STAT.mean(vectorSet.map(d => d[i])))
	}
	return res
}

let substraction = (v1,v2) => {
	const length = Math.min(v1.length, v2.length)
	let tmp = []
	for(let i=0; i < length; i++) tmp.push(v1[i]-v2[i])
	return tmp	
}

const smoothPath = (data, w, f) => {
    w = w || 0


    const getWindow = (data, index, w) => {
        
        w = ((Math.log(index+f)/Math.log(2)) - (Math.log(20)/Math.log(2))+1)*w
        w = ( w <= 0 ) ? 0 : Math.round(w) 
        let res = []
        for(let i = index-w; i <= index+w; i++ ){
            if(!isUndefined(data[i])) res.push(data[i])
        }
        return res
    }

    
    return data.map( (d, index) => STAT.avg(getWindow(data,index,w)))

}


const simplify = (data, step) => {

	if(isUndefined(step)){
		return data
	}
    
    let res = []
    let index = 0

    while( !isUndefined(data[index]) ) {
    	res.push(data[index])
    	index = (index == 0) ? step : index*2
    }

    res.push(data[data.length-1])
    return res

}



const Line = require("line2")


const interpolate = (vector, range, step) => {
	let res = []
	for(let i = range[0]; i<=range[1]; i+=step){
		let index = findIndex(vector, (d, idx) => i >= vector[idx][0] && i <= vector[idx+1][0])
		if( index >= 0) {
			let l = new Line(vector[index][0], vector[index][1], vector[index+1][0], vector[index+1][1])
			res.push([i,l.solveForY(i)])
		} else {
			res.push([i,null])
		}
	
	}

	return res
}

const aggregate = (vector, range, step) => {
	let res = []
	for(let i = range[0]; i<=range[1]; i+=step){
		res.push([i,[]])
	}
	
	let resCurrent = 0

	vector.forEach( (v, index) => {
		
		if(resCurrent >= res.length) return
		
		if((v[0] > res[resCurrent][0] - 0.5*step) && (v[0] < res[resCurrent][0] + 0.5*step)){
			res[resCurrent][1].push(v)
		} else {
			resCurrent++
			if(resCurrent<res.length){
				for( let bi = index-1; bi >= 0; bi--){
					if((vector[bi][0] > res[resCurrent][0] - 0.5*step) && (vector[bi][0] < res[resCurrent][0] + 0.5*step)){
						res[resCurrent][1].push(vector[bi])		
					}
				}
				res[resCurrent][1].push(v)
			}
		}	
	})

	// console.log(JSON.stringify(res, null, " "))
		

	res = res.map( d => [d[0], STAT.mean(d[1].map( dd => dd[1]))])


	// let res = []
	// for(let i = range[0]; i<=range[1]; i+=step){

	// 	let samples = vector.filter( v => (v[0] >= (i-0.5*step)) && (v[0] <= (i+0.5*step)))
		
	// 	// let samples = vector.filter( v => (v[0] > (i-step)) && (v[0] < (i+step)))

	// 	if (samples.length > 0){
	// 		res.push([i, STAT.mean(samples.map(d => d[1]))])
	// 	} else {
	// 		res.push([i,null])
	// 	}
	
	// }
	return res
}



module.exports = {
	sum,
	normEuclide,
	normalize,
	scalarProd, 
	centroid,
	smoothPath,
	substraction,
	interpolate,
	rebase: interpolate,
	aggregate,
	simplify
}

