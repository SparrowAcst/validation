
library(jsonlite) 


execute = function( params ){


	
	p = fromJSON(params)
	
	res = pairwise.wilcox.test(p$data$x, p$data$g, p.adj = "BH")

	return(res)
		
}