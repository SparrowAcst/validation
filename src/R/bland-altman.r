
library(jsonlite) 
library(SimplyAgree)

level = 0.8
delta = NULL
plotFile = "./blade-altman.png"
g = NULL			

execute = function( params ){

	level = 0.8
	delta = NULL

	
	p = fromJSON(params)
	
	if("level" %in% names(p)) level = unlist(p$level)
	
	if("delta" %in% names(p)) delta = unlist(p$delta)
	
	if("plot" %in% names(p)) plotFile = unlist(p$plot)
	
	if(is.null(delta)){
		
		result = agree_test( x = p$x, y = p$y,  agree.level = level)

	} else {
		
		result = agree_test( x = p$x, y = p$y,  agree.level = level, delta = delta)
	
	}
	
	png(plotFile)
	g = plot(result)
	print(g)
	dev.off()

	return(result)
	
}

