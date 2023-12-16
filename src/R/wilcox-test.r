
library(jsonlite) 

mu = NULL
y = NULL
alternative = "two.sided"

execute = function( params ){

	mu = NULL
	y = NULL
	alternative = "two.sided" # less greater

	
	p = fromJSON(params)
	
	if("y" %in% names(p$data)) y = p$data$y
	
	if("mu" %in% names(p)) mu = unlist(p$mu)
	
	if("alternative" %in% names(p)) alternative = unlist(p$alternative)
	

	if(is.null(y)){
		
		res = wilcox.test(p$data$x, mu=mu, alternative=alternative)

	} else {
		
		res = wilcox.test(p$data$x, y, alternative=alternative)
	
	}
	
	return(res)
		
}