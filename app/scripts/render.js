$(app).on('app:dataReady', function (ev) {
	var _groups = app.mobile ? app.professions : app.professionColumns;
	
	// For styling
	$('body').addClass(app.mobile ? 'mobile' : 'desktop')

	// Render chart
	app.chart = new Livsloner(
		app.selector,
		app.mobile,
		app.data,
		_groups);

	// Render story points in desktop
	if (!app.mobile) {
		app.renderStoryPoints();
	};

	// Send height to parent if iframe
	app.isIframe = self !== top;
	app.pymChild = new pym.Child();
	app.sendHeight();
});