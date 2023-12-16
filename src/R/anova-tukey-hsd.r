
library("jsonlite") 
library("readxl")


formula = NULL
aovr = NULL
taovr = NULL
data = NULL

execute = function( params ){

	p = fromJSON(params)
	
	data = read_excel(p$xlsx, sheet = p$sheet) 
	formula = eval(parse(text = p$formula))
	
	aovr = aov(formula, data = data)
	taovr = TukeyHSD(aovr)
	
	return (taovr)
	
}




