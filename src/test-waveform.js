const { getWaveform } = require("./utils/wav")
const { saveJSON } = require("./utils/file-system")

let result = getWaveform(
	"./data/wav/waveform/1.wav",
	{},
	{
		tick: 0.001
	}
)

saveJSON("./wf.json", result)

// console.log(JSON.stringify(result, null, " "))