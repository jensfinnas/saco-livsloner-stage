(function(){
	var storyPoints = [
		{
			title: "Utbildning lönar sig inte för alla",
			content: "För många av de akademiska utbildningarna i vår studie <strong>lönar det sig inte</strong> jämfört med en gymnasieutbildning. De som går dessa utbildningar kan förvänta sig <strong>ekonomisk förlust över livet</strong>. Hit hör bland annat <strong>gruppen lärare</strong>. Läs mer om livslön <a href='http://www.saco.se/vara-fragor/utbildning--forskning/utbildning-ska-lona-sig/' target='_top'>här</a>.", 
			columns:  ["amneslarare","Arbterap", "Biblinfo", "Biolog"]
		},
		{ 
			title: "Höglöneyrken",
			content: "Den akademiska <strong>utbildning med störst lönsamhet</strong> över livet är läkarutbildningen. På andra plats kommer civilingenjörer och på tredje plats ekonomer. Inom dessa yrken finns det <strong>möjligheter till god löneutveckling</strong>. Det är däremot inte så att alla med dessa utbildningar når de högsta lönerna. Läs mer om livslön <a href='http://www.saco.se/vara-fragor/lon-och-livslon/' target='_top'>här</a>.", 
			columns: ["Lakare", "Jurist", "Systvet", "Civ_ing", "Ekonom", "Tandlakare"]
		},
		{ 
			title: "16 % högre livslön",
			content: "Den genomsnittliga lönsamheten för alla akademiska utbildningar är <strong>16 procent</strong>. Men sett över livet är det <strong>stor spridning mellan de som är mest lönsamma och de som är minst lönsamma.</strong> De som har sämst lönsamhet har ett minusresultat på upp till 10 procent, medan de som lönar sig bäst har en lönsamhet på över 50 procent. Läs mer om livslön <a href='http://www.saco.se/vara-fragor/lon-och-livslon/' target='_top'>här</a>.", 
			columns: ["Akademiker_totalt"] 
		}
	];

	var showSlide = function ($slide) {
		// Update graph after slide
		var columns = $slide.attr('data-columns').split(",");
		$('.profession').prop('checked', function() { 
			var column = $(this).attr('value').split('|')[1];
			return $.inArray(column, columns) > -1;
		});
		app.chart.update();
	}

	/*	Render and set settings for the story carousel. 
	*/
	app.renderStoryPoints = function() {
		var templateElement = d3.select("#story-points-template");
		var source   = templateElement.html();
		var template = Handlebars.compile(source);
		var $storyPoints = $('<div/>').html(template(storyPoints));

		// Hackish: Activate the first item of the carousel
		$storyPoints.find('.item').first().addClass('active');
		$(app.selector).prepend($storyPoints);
		showSlide($('.item.active'));
		$storyPoints.find('.carousel').carousel({
			interval: false
		}).on('slide.bs.carousel', function (e) {
			showSlide($(e.relatedTarget));
		});
	}
})()
