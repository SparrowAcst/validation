
const { loadWavFile, time2index , index2time, saveWavFile} = require("./utils/wav")
const {max, min} = require("./utils/stat")
const {findIndex} = require("lodash")

const run = async () => {


	let res = await loadWavFile("./data/wav/EKo500/1.wav")
	console.log("Info", res.info)
	console.log("samples", res.samples.length)
	console.log("samplerate", res.sampleRate)
	console.log("duration", res.samples.length / res.sampleRate, "seconds")

	let start = time2index(0, res.sampleRate)
	let end = time2index(3, res.sampleRate)
	let segment = res.samples.slice(start, end)
	// console.log(segment) 


	let minV = min(segment)
	let maxV = max(segment)
	let scale = 2 / (maxV-minV)
	console.log("!!!", minV, index2time(findIndex(segment, d => d == minV), res.sampleRate), maxV, index2time(findIndex(segment, d => d == maxV), res.sampleRate), scale)
	res.samples = segment.map( (s, index) =>{
		if(index<10) console.log(s, Math.floor(scale*s))
		return Math.floor(32767*s)
	})

	// let segment = res.samples.slice(start, end)
	// console.log(start, end,  segment)
	// console.log(min(res.samples), max(res.samples))	
	saveWavFile("./data/wav/Eko/1-norm-1-3.wav", res)

}



run()



// const tone = require('tonegenerator');
// const header = require('waveheader');
// const {createWriteStream} = require('fs');

// let samples = [];

// const makeChannel = (freq, lengthInSecs) => {
//     let channel = tone({ freq: freq, lengthInSecs: lengthInSecs, volume: tone.MAX_16, rate: 44100,  shape: 'sine' });
//     for (var i = 0; i < channel.length; i++) {
//         samples.push(channel[i])
//     }
// };

// let start = 150;
// let end = 200;
// const increment = 0.1;

// for (let index = parseFloat(start); index <= parseFloat(end); index = parseFloat((index + increment).toFixed(1))) {
//     makeChannel(index, 0.01);
// }

// start = 200;
// end = 300;

// for (let index = parseFloat(start); index <= parseFloat(end); index = parseFloat((index + increment).toFixed(1))) {
//     makeChannel(index, 0.01);
// }

// start = 300;
// end = 400;

// for (let index = parseFloat(start); index <= parseFloat(end); index = parseFloat((index + increment).toFixed(1))) {
//     makeChannel(index, 0.015);
// }

// let file = createWriteStream('./data/wav/Eko/1-tones.wav');

// file.write(header(samples.length * 2, {
//     channels: 2,
//     bitDepth: 16
// }));

// const data = Int16Array.from(samples);

// const size = data.length * 2;

// const buffer = new Buffer.alloc(size);

// data.forEach((value, index) => {
//     buffer.writeInt16LE(value, index * 2)
// });

// file.write(buffer);
// file.end();