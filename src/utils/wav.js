
const benchmark = require('exectimer')
const fs = require("fs")
const path = require("path")
const wav = require("node-wav")
const { FFT } = require("dsp.js")
const wavFileInfo = require('wav-file-info')
const { keys, extend, zipObject, isUndefined } = require("lodash")
const { centroid, rebase, aggregate, smoothPath, normEuclide, normalize } = require("./vector")


const getWindowSpectrum = ( window, sampleRate, frequencyRange ) => {
	const fft = new FFT(window.length, sampleRate)
	fft.forward(window)
	let spectrum = fft.spectrum
	spectrum = keys(spectrum).map( key => [Number.parseFloat(key)*sampleRate/window.length,spectrum[key]])
	spectrum = aggregate( spectrum, frequencyRange, 1 )
	return {
		frequencies: spectrum.map( d => d[0] ),
		magnitudes: spectrum.map( d => d[1] )
	}	
}

const getWavSpectrum = ( filePath, metadata, params ) => {

	const frequencyRange = params.frequency.range || [0,2000]
	
	// wavFileInfo.infoByFilename(filePath, function(err, info){
	// if (err) throw err;
	// 	console.log(info);
	// })

	let tick = new benchmark.Tick(filePath);

	let buffer = fs.readFileSync(filePath)
	buffer = wav.decode(buffer)
	let audioData = Array.prototype.slice.call( buffer.channelData[0])

	let windowSize = Math.pow(2, Math.trunc(Math.log(buffer.sampleRate)/Math.log(2))+2)
	console.log("Simple rate: ", buffer.sampleRate, "size:", audioData.length)
	
	tick.start()

	let spectra = []
	let windowIndex = 0
	let window = audioData.slice( windowIndex*windowSize, windowSize )
	let frequencies
	
	for( ; window.length == windowSize; windowIndex++ ){
		const temp = getWindowSpectrum( window, buffer.sampleRate, frequencyRange )
		spectra.push(temp.magnitudes)
		if(!frequencies) frequencies = temp.frequencies
		window = audioData.slice( windowIndex*windowSize, windowSize )
	}

	for( let i = window.length; i < windowSize; i++ ){
		window.push(0)
	}

	spectra.push( getWindowSpectrum( window, buffer.sampleRate, frequencyRange ).magnitudes)
	
	tick.stop()

	let magnitudes =  centroid(spectra).slice( frequencyRange[0], frequencyRange[1] - frequencyRange[0] + 1 )//,


	return {
		params,
		metadata: extend({}, metadata, {
			filePath,
			fileName: path.basename(filePath),
			sampleRate: buffer.sampleRate,
			length: audioData.length,
			windowSize,
			"benchmark (ticks)": benchmark.timers[filePath].duration(),
			"benchmark (time)": benchmark.timers[filePath].parse(benchmark.timers[filePath].duration())
			
		}),
		spectrum: zipObject( 
			frequencies.slice( frequencyRange[0], frequencyRange[1] - frequencyRange[0] + 1 ), 
			magnitudes
		)
	}	

} 

module.exports = {
	getSpectrum: getWavSpectrum
}