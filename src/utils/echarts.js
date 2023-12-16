

const echarts = require('echarts')
const fs = require("fs")
const path = require("path")
const moment = require("moment")
const { createCanvas } = require('canvas');
const { makeDir } = require("./file-system")


const renderCanvas = async options => {
	
	let width = options.width || 800
	let height = options.height || 600
	let chartOptions = options.chart || {}
	
	let filename = options.fs || `./${moment(new Date()).format("YY-MM-DD-HH-mm-ss")}.png`
	filename = path.resolve(filename)
	await makeDir(path.dirname(filename))

	echarts.setCanvasCreator(() => {
	  return createCanvas()
	});

	const canvas = createCanvas(width, height)
	let chart = echarts.init(canvas)
	chart.setOption(chartOptions)

	const buffer = chart.renderToCanvas().toBuffer('image/png');

	chart.dispose();

	fs.writeFileSync(filename, buffer)

}

const renderSVG = async options => {
	let width = options.width || 800
	let height = options.height || 600
	let chartOptions = options.chart || {}
	
	let filename = options.fs || `./${moment(new Date()).format("YY-MM-DD-HH-mm-ss")}.svg`
	filename = path.resolve(filename)
	await makeDir(path.dirname(filename))

	let chart = echarts.init(null, null, {
	  renderer: 'svg', // must use SVG rendering mode
	  ssr: true, // enable SSR
	  width, // need to specify height and width
	  height
	})
	
	chart.setOption(chartOptions)

	const svgStr = chart.renderToSVGString()

	chart.dispose();

	fs.writeFileSync(filename, svgStr)	

}


const render = async options => {
	let filename = options.fs || ""
	let ext = path.extname(filename)
	if(ext == ".png"){
		await renderCanvas(options)
	} else {
		await renderSVG(options)
	}
}

module.exports = render
