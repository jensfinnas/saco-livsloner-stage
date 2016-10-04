app.sendHeight = function() {
	if (app.isIframe) {
	  app.pymChild.sendHeight();
	}
};