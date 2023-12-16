
library(jsonlite) 
library(Metrics)

execute = function( params ){
	
	p = fromJSON(params)
	return(Metrics::f1(p$predicted, p$actual))
	
}
