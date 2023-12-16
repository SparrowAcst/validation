
library(jsonlite) 
library(Metrics)

execute = function( params ){
	
	p = fromJSON(params)
	return(Metrics::recall(p$predicted, p$actual))
	
}

