const benchmark = require('exectimer')
const fs = require("fs")
const path = require("path")
const wav = require("node-wav")
const { FFT } = require("dsp.js")
const wavFileInfo = require('wav-file-info')
const { keys, extend, zipObject, isUndefined } = require("lodash")
const { centroid, rebase, aggregate, smoothPath, normEuclide, normalize } = require("./vector")
const { avg, max, sum, gmean } = require("./stat")

const header = require('./wav-header');


const time2index = (t, sampleRate) => t * sampleRate
const index2time = (index, sampleRate) => index / sampleRate


const getWavInfo = filepath => new Promise((resolve, reject) => {

    wavFileInfo.infoByFilename(filepath, function(err, info) {
        if (err) reject(err)
        resolve(info)

    })

})

const loadWavFile = async filepath => {

    let buffer = fs.readFileSync(filepath)
    buffer = wav.decode(buffer)
    let samples = Array.prototype.slice.call(buffer.channelData[0])
    let info = await getWavInfo(filepath)
    return {
        info,
        samples,
        sampleRate: buffer.sampleRate
    }
}


const saveWavFile = (filepath, data) => {

    let file = fs.createWriteStream(filepath);
    file.write(header(data.samples.length * 2, data.info.header));

    const d = Int16Array.from(data.samples);

    const size = data.samples.length * 2;

    const buffer = new Buffer.alloc(size);

    d.forEach((value, index) => {
        buffer.writeInt16LE(value, index * 2)
    });

    file.write(buffer)

    file.end()
}


const getWindowSpectrum = (window, sampleRate, frequencyRange) => {
    const fft = new FFT(window.length, sampleRate)
    fft.forward(window)
    let spectrum = fft.spectrum
    spectrum = keys(spectrum).map(key => [Number.parseFloat(key) * sampleRate / window.length, spectrum[key]])
    spectrum = aggregate(spectrum, frequencyRange, 1)
    return {
        frequencies: spectrum.map(d => d[0]),
        magnitudes: spectrum.map(d => d[1])
    }
}

const getWavSpectrum = (filePath, metadata, params) => {

    const frequencyRange = params.frequency.range || [0, 2000]

    // wavFileInfo.infoByFilename(filePath, function(err, info){
    // if (err) throw err;
    // 	console.log(info);
    // })

    let tick = new benchmark.Tick(filePath);

    let buffer = fs.readFileSync(filePath)
    buffer = wav.decode(buffer)
    let audioData = Array.prototype.slice.call(buffer.channelData[0])

    let semiWindowSize = Math.pow(2, Math.trunc(Math.log(buffer.sampleRate) / Math.log(2)) + 1)
    let windowSize = semiWindowSize * 2
    // let windowSize = Math.pow(2, Math.trunc(Math.log(buffer.sampleRate)/Math.log(2))+1)

    console.log("Simple rate: ", buffer.sampleRate, "size:", audioData.length, "window size:", windowSize)

    tick.start()

    let spectra = []
    let windowIndex = 0
    let window = audioData.slice(windowIndex * windowSize, windowSize)
    windowIndex++
    let frequencies

    for (; window.length == windowSize; windowIndex++) {
        const temp = getWindowSpectrum(window, buffer.sampleRate, frequencyRange)
        spectra.push(temp.magnitudes)
        if (!frequencies) frequencies = temp.frequencies
        window = audioData.slice(windowIndex * windowSize, windowIndex * windowSize + windowSize)
        // console.log("index:", windowIndex,"wsize:",windowSize,"start:", windowIndex*semiWindowSize,"length:", window.length)
    }

    for (let i = window.length; i < windowSize; i++) {
        window.push(0)
    }

    spectra.push(getWindowSpectrum(window, buffer.sampleRate, frequencyRange).magnitudes)

    // console.log("window index", windowIndex)
    tick.stop()

    let magnitudes = centroid(spectra).slice(frequencyRange[0], frequencyRange[1] - frequencyRange[0] + 1) //,


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
            frequencies.slice(frequencyRange[0], frequencyRange[1] - frequencyRange[0] + 1),
            magnitudes
        )
    }

}


const f = x => x //(Math.abs(x)<0.3) ? x/10 : x //Math.sign(x)*Math.log(Math.abs(x))

const getWaveform = (filePath, metadata, params) => {

    params.ratio = params.ratio || 2
    params.tick = params.tick || 0.005


    let buffer = fs.readFileSync(filePath)
    buffer = wav.decode(buffer)

    let audioData = Array.prototype.slice.call(buffer.channelData[0])

    let windowIndex = 0
    let windowSize = Math.round(params.ratio * params.tick * buffer.sampleRate)
    // console.log(windowSize)

    let window = audioData.slice(0, windowSize)
    // console.log(window)

    let aForm = [0]
    while (window.length == windowSize) {
        aForm.push(gmean(window.map(d => Math.abs(d))))
        windowIndex++
        window = audioData.slice(windowIndex * windowSize, windowIndex * windowSize + windowSize)
    }

    let maxValue = max(aForm)

    return {
        params,
        metadata: extend({}, metadata, {
            filePath,
            fileName: path.basename(filePath),
            sampleRate: buffer.sampleRate,
            length: audioData.length,
            tick: params.tick,
            ratio: params.ratio
        }),

        waveform: aForm.map(d => Number.parseFloat((d / maxValue).toFixed(3)))
    }

    // return waveForm	

}


module.exports = {
    getSpectrum: getWavSpectrum,
    getWaveform,
    loadWavFile,
    saveWavFile,
    time2index,
    index2time
}