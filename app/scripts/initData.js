(function() {
	app.init = function() {
		d3.csv(app.dataPath, function(row) {
			var _row = {};
			// Turn strings to numbers
			for (key in row) {
				_row[key] = +row[key].replace(",",".");
			}
			return _row;
		}, function(error, resp) {
			app.data = resp;
			$(app).trigger('app:dataReady');
		});
	}	
})();