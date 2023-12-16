
library(jsonlite) 
library(Metrics)

execute = function( params ){
	
	p = fromJSON(params)
	return(Metrics::precision(p$predicted, p$actual))
	
}

