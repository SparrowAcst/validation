const mammoth = require("mammoth") 
const { keys } = require("lodash") 

let template = {
	
	patientId:{
		select: /КОД ПАЦІЄНТА([\s\S]*)СТАТЬ/m,
		replace: [/[\_\s]/gm, ""],
	},
	
	gender:{
		select: /СТАТЬ([\s\S]*)ВІК/m,
		replace: [/[\_\s]/gm, ""],
	},

	age:{
		select: /ВІК([\s\S]*)МІСТО/m,
		replace: [/[\_\s]/gm, ""],
		return: text => Number.parseInt(text)
	},

	city:{
		select: /МІСТО([\s\S]*)ІСТОРІЯ ПАЦІЄНТА/m,
		replace: [/[\_\s]/gm, ""],
	},

	story:{
		select: /ІСТОРІЯ ПАЦІЄНТА([\s\S]*)ВРАЖЕННЯ ПАЦІЄНТА ВІД ДОСВІДУ РОБОТИ ЗІ СТЕТОФОНОМ\?/m,
		replace: [/[\n]+/gm, "\n"],
		return: text => {
			let ws = "Додаткова інформація про особу пацієнта. У чому була особливість використання Стетофону для цього пацієнта? Чи допоміг Стетофон обстежити цього пацієнта краще (швидше, зручніше, знайти важливі симптоми, тощо)?"
			let index = text.indexOf(ws)
			return (index > -1) ? text.substring(text.indexOf(ws) + ws.length) : text
		}	
	},

	review:{
		select: /ВРАЖЕННЯ ПАЦІЄНТА ВІД ДОСВІДУ РОБОТИ ЗІ СТЕТОФОНОМ\?([\s\S]*$)/m,
		replace: [/[\n]+/gm, "\n"],
	}	
}


const extractTextFromFile = async file => {
	const result = await mammoth.extractRawText({path: file})
	return result.value		
}

const getDataFromText = (data, template) => {
	let res = {}
	keys(template).forEach( key => {
		let rule = template[key]
		rule.return = rule.return || ( d => d )

		let matches = data.match(rule.select)
		
		if(matches && matches[1]){
			res[key] = rule.return((rule.replace) ? matches[1].replace(rule.replace[0], rule.replace[1]) : matches[1])
		}
	})
	return res		

}

module.exports = {
	getDataFromText,
	extractTextFromFile
}



const run = async () => {
	try {
		

		const text = await extractTextFromFile("./src/utils/WORD1.docx")
		console.log( JSON.stringify(getDataFromText(text, template), null, " ") )
	
	} catch (e){
		console.log(e.toString())
	}	
} 

run()

