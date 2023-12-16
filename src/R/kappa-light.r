
library(jsonlite) 
library(irr) 

execute = function( params ){
	
	p = fromJSON(params)
	
	result = kappam.light(p$data)

	return(result)
	
}

