

library(jsonlite) 
library(caret)

execute = function( params ){
	
	p = fromJSON(params)
	xtab <- table(p$predicted, p$actual)
	cm <- caret::confusionMatrix(xtab)
	return(cm)
	
}


