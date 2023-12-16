const googledriveService = require("./utils/google-drive")
const { loadXLSX, saveXLSX } = require("./utils/xlsx")
const wav2spectrum  = require("./utils/wav2spectrum")
const { extend } = require("lodash")
const render = require("./utils/echarts")

const run = async () => {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// const googleDrive = await googledriveService.create("VALIDATION-TEST-DATA")

	// console.log(googleDrive.dirList( f => f.name.startsWith("SOURCE")))

	// console.log(googleDrive.fileList( f => f.mimeType != "application/vnd.google-apps.spreadsheet"))

	// await googleDrive.downloadFiles({
	// 	fs: "./data/downloads/"
	// })

	// await googleDrive.test()
	// console.log("Complete")

	// console.log((await getFileList()))

	// await googleDrive.uploadFiles({
	// 	fs: "./data/downloads/*.*",
	// 	googleDrive: "VALIDATION-TEST-DATA/TEST-UPLOAD"
	// })

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// let res = await loadXLSX(
	// 	"./data/downloads/Validation of Loudness of the Chest Sound Provided by Stethophone v3.0.0.xlsx"
	// 	,
	// 	"Validation of Loudness of the C"
	// )

	// console.log(res)

	// await saveXLSX(
	// 	res,
	// 	"./data/processed/test.xlsx",
	// 	"result"
	// )
	// await saveXLSX(
	// 	res
	// 	// ,
	// 	// "./data/processed/test.xlsx",
	// 	// "result"
	// )
	// await saveXLSX(
	// 	[1,2,3,4,5]
	// 	// ,
	// 	// "./data/processed/test.xlsx",
	// 	// "result"
	// )
	// await saveXLSX(
	// 	"QWERTY"
	// 	// ,
	// 	// "./data/processed/test.xlsx",
	// 	// "result"
	// )

////////////////////////////////////////////////////////////////////

	// let res = await wav2spectrum({
	// 	fs: "./data/wav/*/*.wav",
	// 	metadata: { message: "test"}, 
	// 	params: { frequency:{range: [0, 2000]}} 
	// })
	
	// res = res.map( s => extend(
	// 	{}, 
	// 	s.spectrum,
	// 	{
	// 		message: s.metadata.message,
	// 		name: s.metadata.fileName,
	// 		path: s.metadata.file
	// 	}
	// ))
	
	// await saveXLSX(
	// 	res,
	// 	"./data/processed/spectra.xlsx"
	// )

////////////////////////////////////////////////////////////////////	
	
	// const R = require('./utils/R');


	// // let data = [{
	// // 	name:"name",
	// // 	value: 1
	// // }]

	// let data = [1,2,3]

	// // let result = R.call("./src/R/test.r", "printObject", data);
	
	// let result = await R.callAsync("./src/R/test.r", "getMax", data);
	
	// console.log(result);


//////////////////////////////////////////////////////////////////////


// const dataAll = [
//   [
//     [10.0, 8.04],
//     [8.0, 6.95],
//     [13.0, 7.58],
//     [9.0, 8.81],
//     [11.0, 8.33],
//     [14.0, 9.96],
//     [6.0, 7.24],
//     [4.0, 4.26],
//     [12.0, 10.84],
//     [7.0, 4.82],
//     [5.0, 5.68]
//   ],
//   [
//     [10.0, 9.14],
//     [8.0, 8.14],
//     [13.0, 8.74],
//     [9.0, 8.77],
//     [11.0, 9.26],
//     [14.0, 8.1],
//     [6.0, 6.13],
//     [4.0, 3.1],
//     [12.0, 9.13],
//     [7.0, 7.26],
//     [5.0, 4.74]
//   ],
//   [
//     [10.0, 7.46],
//     [8.0, 6.77],
//     [13.0, 12.74],
//     [9.0, 7.11],
//     [11.0, 7.81],
//     [14.0, 8.84],
//     [6.0, 6.08],
//     [4.0, 5.39],
//     [12.0, 8.15],
//     [7.0, 6.42],
//     [5.0, 5.73]
//   ],
//   [
//     [8.0, 6.58],
//     [8.0, 5.76],
//     [8.0, 7.71],
//     [8.0, 8.84],
//     [8.0, 8.47],
//     [8.0, 7.04],
//     [8.0, 5.25],
//     [19.0, 12.5],
//     [8.0, 5.56],
//     [8.0, 7.91],
//     [8.0, 6.89]
//   ]
// ];
// const markLineOpt = {
//   animation: false,
//   label: {
//     formatter: 'y = 0.5 * x + 3',
//     align: 'right'
//   },
//   lineStyle: {
//     type: 'solid'
//   },
//   tooltip: {
//     formatter: 'y = 0.5 * x + 3'
//   },
//   data: [
//     [
//       {
//         coord: [0, 3],
//         symbol: 'none'
//       },
//       {
//         coord: [20, 13],
//         symbol: 'none'
//       }
//     ]
//   ]
// };
// let chart = {
//   title: {
//     text: "Anscombe's quartet",
//     left: 'center',
//     top: 0
//   },
//   grid: [
//     { left: '7%', top: '7%', width: '38%', height: '38%' },
//     { right: '7%', top: '7%', width: '38%', height: '38%' },
//     { left: '7%', bottom: '7%', width: '38%', height: '38%' },
//     { right: '7%', bottom: '7%', width: '38%', height: '38%' }
//   ],
//   tooltip: {
//     formatter: 'Group {a}: ({c})'
//   },
//   xAxis: [
//     { gridIndex: 0, min: 0, max: 20 },
//     { gridIndex: 1, min: 0, max: 20 },
//     { gridIndex: 2, min: 0, max: 20 },
//     { gridIndex: 3, min: 0, max: 20 }
//   ],
//   yAxis: [
//     { gridIndex: 0, min: 0, max: 15 },
//     { gridIndex: 1, min: 0, max: 15 },
//     { gridIndex: 2, min: 0, max: 15 },
//     { gridIndex: 3, min: 0, max: 15 }
//   ],
//   series: [
//     {
//       name: 'I',
//       type: 'scatter',
//       xAxisIndex: 0,
//       yAxisIndex: 0,
//       data: dataAll[0],
//       markLine: markLineOpt
//     },
//     {
//       name: 'II',
//       type: 'scatter',
//       xAxisIndex: 1,
//       yAxisIndex: 1,
//       data: dataAll[1],
//       markLine: markLineOpt
//     },
//     {
//       name: 'III',
//       type: 'scatter',
//       xAxisIndex: 2,
//       yAxisIndex: 2,
//       data: dataAll[2],
//       markLine: markLineOpt
//     },
//     {
//       name: 'IV',
//       type: 'scatter',
//       xAxisIndex: 3,
//       yAxisIndex: 3,
//       data: dataAll[3],
//       markLine: markLineOpt
//     }
//   ]
// };

// 	await render({
// 		fs:"./data/processed/charts/chart1.png",
// 		chart,
// 		// width: 200,
// 		// height:100
// 	})

//////////////////////////////////////////////////////////////////////////////////////////////
	// const R = require('./utils/R');

	// let data = await loadXLSX("./data/xlsx/PRETEST-SEG.xlsx", "segment")
	
	
	// let x = data.map(d => d[' ecoStart '])
	// let y = data.map(d => d[' stStart'])
	
	// let result = await R.call("./src/R/bland-altman.r", "execute", {
	// 	plot: "./data/bland-altman-plot.png",
	// 	x,
	// 	y,
	// 	level: 0.8,
	// 	delta: 0.16
	// })

	// console.log(result)

/////////////////////////////////////////////////////////////////////////////////////////////////

	// const R = require('./utils/R');
		
	// let result = await R.call("./src/R/anova-tukey-hsd.r", "execute", {
	// 	xlsx: "./data/xlsx/DATAPOOL-15-11-23.xlsx", 
	// 	sheet: "inf",
	// 	formula: "acceptable ~ device * dataset"
	// })

	// console.log(result)
	
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	const R = require('./utils/R');
	
	// let data = [
	// 	[5,	4,	3,	5,	2],
	// 	[2,	3,	2,	3,	5],
	// 	[3,	5,	1,	1,	3]
	// ]

	// let data = [
	// 	[5,	4,	4,	4, 4,	4,	4,	4],
	// 	[4,	4,	4,	4, 4,	4,	4,	4],
	// 	[5,	4,	4,	4, 4,	4,	4,	4],
	// 	[5,	5,	5,	5, 5,	5,	5,	5],
	// 	[5,	4,	4,	4, 4,	4,	4,	4]
	// ]



	// let result = await R.call("./src/R/kappa-light.r", "execute", {data})

	// console.log(result)

	// let data = {
	// 	predicted: [1,1,1,0,0],
	// 	actual:[1,0,1,1,1]	
	// }

	// let result = await R.call("./src/R/confusion-matrix.r", "execute", data )
	// console.log(result)
	// result = await R.call("./src/R/recall.r", "execute", data )
	// console.log(result)
	// result = await R.call("./src/R/precision.r", "execute", data )
	// console.log(result)
	// result = await R.call("./src/R/f1-score.r", "execute", data )
	// console.log(result)

/////////////////////////////////////////////////////////////////////////////////////////////////


	// let data = {
	// 	x: [1,1,1,0,0],
	// 	// y:[1,0,1,1,1]	
	// }
			
	// let result = await R.call("./src/R/wilcox-test.r", "execute", {
	// 	data,
	// 	mu: 0,
	// 	alternative: "greater" 
	// })
	// console.log(result)
////////////////////////////////////////////////////////////////////////////////////////////////////

let data = {
		x: [1,1,1,0,0],
		g:[1,0,2,2,1]	
	}
			
	let result = await R.call("./src/R/pairwise-wilcox-test.r", "execute", {data})
	console.log(result)

}

run()

