/*	Livsloner is a linechart, including UI, for displaying life time salaries
	for employees with an academic education.
	Livsloner can be rendered in a striped down mobile version or a wider desktop
	version with option to select multiple professions. 
*/
Livsloner = (function() {
	function Livsloner(selector, mobile, data, groups) {
		var self = this;
		self.mobile = mobile;
		self.data = data;
		self.groups = groups;
		self.container = d3.select(selector);
		var containerWidth = self.container[0][0].offsetWidth;
		
		self.chartContainer = self.container.append("div")
			.attr('class', 'chart ' + (mobile ? 'mobile' : 'desktop'));

		var desktopMargins = {top: 10, right: 200, bottom: 30, left: 70};
		var mobileMargins = {top: 10, right: 40, bottom: 30, left: 27};

		self.margin = m = mobile ? mobileMargins : desktopMargins;
		self.width = (containerWidth - m.left - m.right);
		var _height = mobile ? 270 : 320;
		self.height = _height - m.top - m.bottom;

		self.drawNavigation();
		self.drawCanvas();
		self.sentenceContainer = self.chartContainer.append("div")
			.attr('class', 'sentence');

		self.sentenceContainer.append('div')
			.attr('class', 'header');
		self.sentenceContainer.append('div')
			.attr('class', 'body');
			
		self.initChart();
	}
	/*	In mobile render a simple select dropdown where the user can pick a profession.
		In desktop show the more advanced UI with possibility to pick multiple professions.
	*/
	Livsloner.prototype.drawNavigation = function() {
		var self = this;
		// Draw mobile ui
		if (self.mobile) {
			self.navigationContainer = self.container
				.insert("div",":first-child")
				.attr('class', 'navigation');
			var templateElement = d3.select("#navigation-mobile");
		}
		else {
			self.navigationContainer = self.container
				.append("div")
				.attr('class', 'navigation ' + (self.mobile ? 'mobile' : 'desktop'));
			var templateElement = d3.select("#navigation-desktop");
		}
		var source   = templateElement.html();
		var template = Handlebars.compile(source);

		self.navigationContainer.html( template( self.groups ) );
		self.navigationContainer.selectAll('.profession').on("change", function() {
			self.update();
		});
		/* 	In desktop check all professions when a group heading is clicked. 
			And uncheck the others.
		*/
		self.navigationContainer.selectAll('.panel-heading').on('click', function() {
			d3.selectAll('.profession').property('checked', false);
			d3.select(this.parentElement).selectAll('.profession').property('checked', true);
			self.update();
		})
	};

	// Draw base svg
	Livsloner.prototype.drawCanvas = function() {
		var self = this;
		var w = self.width;
		var h = self.height;
		var m = self.margin;

		self.svg = self.chartContainer.append('svg')
		  .attr('width', w + m.left + m.right)
		  .attr('height', h + m.top + m.bottom);

		self.chart = self.svg
		  .append('g')
		  .attr("transform", "translate(" + (m.left) + "," + (m.top) + ")")
	};

	// Set up scales, draw axes and labels
	Livsloner.prototype.initChart = function() {
		var self = this;
		self.x = d3.scale.linear()
		    .range([0, self.width])
		    .domain([19,85]); 

		self.y = d3.scale.linear()
		    .range([self.height, 0])
		    .domain([0,26500000]);

		self.xAxis = d3.svg.axis()
		    .scale(self.x)
		    .ticks(self.mobile ? 5 : 10)
		    .orient("bottom");

		self.yAxis = d3.svg.axis()
		    .scale(self.y)
		    //.tickSize(-self.width)
		    .tickFormat(function(d) { return d / 1000000 })
		    .orient("left");

		self.line = d3.svg.line()
          .interpolate('linear')
          .x(function(d){ return self.x(d.age) })
          .y(function(d){ return self.y(d.salary) });


        self.areaAbove = d3.svg.area()
            .interpolate("basis")
            .x(self.line.x())
            .y0(function(d) {
            	return self.y(d.baseline); 
            })
            .y1(function(d) { 
            	return self.y(Math.max(d.baseline, d.salary)); 
            });

        self.areaBelow = d3.svg.area()
            .interpolate("basis")
            .x(self.line.x())
            .y0(function(d) {
            	return self.y(d.baseline); 
            })
            .y1(function(d) { 
            	return self.y(Math.min(d.baseline, d.salary)); 
            });

        self.overlay = self.svg.append('rect')
        	.attr('class', 'overlay')
        	.attr('width', self.width + self.margin.left + self.margin.right)
        	.attr('height', self.height + self.margin.top + self.margin.bottom)
        	.attr('fill', '#fff');


		 self.chart.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + self.height + ")")
		      .call(self.xAxis)
		    .append("text")
		      .attr("x", 0)
		      .attr("transform","translate(" + self.width + ",0)")
		      .attr("dy", "-.35em")
		      .style("text-anchor", "end")
			  .attr("class", "caption")
		      .text("Ålder");

		  self.chart.append("g")
		      .attr("class", "y axis")
		      .call(self.yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("x", -10)
			  .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
			  .attr("class", "caption")
		      .text("Livslön efter skatt (Mkr)");

		if (!self.mobile) {
			$(".y.axis .caption").tooltip({
				'container': 'body',
				'placement': 'right',
				'title' : 'I begreppet livslön inräknas både lön och pension efter skatt, studiemedel räknas som inkomst under studietiden. Den årliga avbetalningen av studieskulden dras bort från lönen under återbetalningstiden. Hänsyn tas till att risken för arbetslöshet varierar mellan olika akademikergrupper och gymnasieutbildade. Alla beräkningar är gjorda utifrån 2009 års siffror.'
			});
		}

	};
	Livsloner.prototype.drawBaseline = function() {
		var self = this;
	};
	Livsloner.prototype.updateLines = function(callbacks) {
		var self = this;

		// Remove unselected professions
		self.lineGroups.exit().transition()
			.remove();

		self.enteringLineGroups = self.lineGroups.enter()
			.append('g')
			.attr('class', function(d,i) {
				return 'line-group ' + (i == 0 ? 'baseline' : 'profession-line')
			});

		var pathGroup = self.enteringLineGroups.append("g")
			.attr('class', 'path-group')
			.datum(function(d) { return d.values });

		pathGroup.append("path")
			.attr("class", "line")
			.attr("d", self.line);

		pathGroup.append("path")
			.attr("class", "area above");
		
		pathGroup.append("path")
			.attr("class", "area below");

		
		if (!self.mobile) {
			// On mouse over
			self.enteringLineGroups.on('mouseover', function() {
				var hoveredLineGroup = this;

				self.updateBackgroundArea({ self: self });

				d3.select(this).classed('highlighted', true);
				
				// Fade out other lines
				self.lineGroups.classed('faded', function() {
					return this !== hoveredLineGroup && !d3.select(this).classed('baseline');
				});
				var baseline = self.chart.select('.line-group.baseline')[0][0];
				
				// Show break even
				self.breakEven = getBreakEvenPoint(baseline.__data__, hoveredLineGroup.__data__);
				self.finalSalaries = getFinalSalaries(baseline.__data__, hoveredLineGroup.__data__);
				self.addBreakEven();
				self.addSentence();
			})
			.on('mouseout', function() {
				self.lineGroups
					.classed('faded', false);
				
				/*	Don't remove annotation if only one line is selected 
				*/
				if (self.lineGroups[0].length !== 2) {
					self.lineGroups.classed('highlighted', false);
					self.removeAnnotation();
				}
			});	
		}
		
		run(callbacks);
		/*
		// Animate entering lines
		if (self.mobile) {
			var animationDuration = 300;

			var totalLength;
			path[0].forEach(function(node) {
				if (node) {
					totalLength = Math.max(node.getTotalLength(), totalLength);
				}
			});
			var numberOfExistingLines = self.enteringLineGroups[0].filter(function(d) {
				return d === null;
			}).length;
			path.attr("stroke-dasharray", totalLength + " " + totalLength)
				.attr("stroke-dashoffset", totalLength)
				.transition()
				.duration(animationDuration)
				.delay(function(d,i) {
					return (i - numberOfExistingLines) * animationDuration;
				})
				.ease("linear")
				.attr("stroke-dashoffset", 0)
				// Add break even after animation
				.call(transitionEnd, function() { run(callbacks) });	
		}
		else {
			run(callbacks);
		}*/

		
		

	};
	/*	The background areas needs to be updated with every new selection as
		baseline can change.
	*/
	Livsloner.prototype.updateBackgroundArea = function(args) {
		var self;
		if (args) {
			if (args.self) {
				self = args.self;
			}
		}
		var baselineValues = self.chart.select('.baseline')[0][0].__data__.values;
		var _addBaseLineData = function(values) {
			return values.map(function(d,i) {
				d.baseline = baselineValues[i].salary;
				return d;
			})
		}

		var pathGroups = self.chart.selectAll('.path-group')
			.datum(function(d) { 
				return _addBaseLineData(d); 
			});

		pathGroups.selectAll(".area.above")
			.attr("d", self.areaAbove);
		
		pathGroups.selectAll(".area.below")
			.attr("d", self.areaBelow);

		var baselineFinalSalary = baselineValues[baselineValues.length - 1].salary;
		self.chart.selectAll('.line-group').sort(function(a,b) {
			return Math.abs(baselineFinalSalary - b.finalSalary) - Math.abs(baselineFinalSalary - a.finalSalary);
		})

	}

	Livsloner.prototype.addBreakEven = function(args) {
		var self;
		if (args) {
			if (args.self) {
				self = args.self;
			}
		}
		else {
			self = this;
		}
		if (self.breakEven) {
			var cx = self.x(self.breakEven.age);
			var cy = self.y(self.breakEven.salary);
			var reverseLabel = self.width - cx < 50; 
			var radius = 5; 
			self.breakEvenGroup = self.chart.append('g')
				.attr('transform', 'translate(' + [cx, cy] +')')
				.attr('class', 'break-even annotation');

			self.breakEvenGroup.append('circle')
				.attr('r', 0)
				.transition()
				.duration(800)
				.ease('bounce')
				.attr('r', radius);

			self.breakEvenGroup.append('text')
				.text(self.breakEven.age + ' år')
				.attr('dy', '.35em')
				.attr('x', ((radius + 4) * (reverseLabel ? -1 : 1)))
				.attr('class', 'label')
				.attr('text-anchor', reverseLabel ? 'end' : 'start')
		}
	};

	Livsloner.prototype.addSentence = function(args) {
		var self;
		if (args) {
			if (args.self) {
				self = args.self;
			}
		}
		else {
			self = this;
		};

		var baselineLabel = self.chart.select('.baseline.line-group')[0][0].__data__.label.toLowerCase();
		var sentence = getSentence(self.breakEven, self.finalSalaries, baselineLabel);
		self.sentenceContainer.classed('hidden', false);
		self.sentenceContainer.select('.header').html(self.finalSalaries.professionLabel);
		self.sentenceContainer.select('.body').html(sentence);
	}
	/*	If only one profession is selected in desktop we want to show
		the background areas highlighting the difference.
	*/
	Livsloner.prototype.highlightSelectedProfession = function(args) {
		var self;
		if (args) {
			if (args.self) {
				self = args.self;
			}
		}
		else {
			self = this;
		}
		self.chart.selectAll('.profession-line').classed('highlighted', true);
	}


	Livsloner.prototype.annotateDifference = function(args) {
		var self;
		if (args) {
			if (args.self) {
				self = args.self;
			}
		}
		else {
			self = this;
		}
		if (self.finalSalaries) {
			var _y = (self.y(self.finalSalaries.baseline) + self.y(self.finalSalaries.profession)) / 2;
			var lineHeight = self.height - self.y(Math.abs(self.finalSalaries.difference));
			var direction = self.finalSalaries.difference > 0 ? 'plus' : 'minus';
			var g = self.chart.append('g')
				.attr('class', 'difference annotation ' + direction)
				.attr('transform', 'translate(' + [self.width, _y] +')');

			g.append('line')
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", -lineHeight / 2)
				.attr("y2", lineHeight / 2);

			g.append('text')
				.attr('dy', '.75em')
				.attr('y', 5)
				.attr('transform', 'rotate(-90)')
				.text('Skillnad: ' + (self.finalSalaries.difference > 0 ? '+' : '') + formatMillionSEK(self.finalSalaries.difference));
		}

	};
	/*	This is only used in mobile
	*/
	Livsloner.prototype.annotateLines = function(args) {
		var self;
		if (args) {
			if (args.self) {
				self = args.self;
			}
		}
		else {
			self = this;
		}
		var coordinates = {
			above: { x: 0.2, y: 0.32},
			below: { x: 0.5, y: 0.8},
		}
		var g = self.lineGroups.append('g')
			.attr('class', 'line-label annotation')
			.attr('transform', function(d,i) {
				var position;
				var isBaseline = i == 0;
				if (isBaseline) {
					// Place baseline label below line if 
					position = self.breakEven.age < 55 ? 'below' : 'above'
				}
				else {
					position = self.breakEven.age < 55 ? 'above' : 'below'					
				}
				var x = coordinates[position].x * self.width;
				var y = coordinates[position].y * self.height;
				return 'translate('+[x,y]+')';
			});
		g.append("text").each(function (d) {
			var str = addLineBreaks(d.label, 15);
			addLineBreaksToSVG(str, this);
		});

		var colorKeySize = 6;
		g.append("rect")
			.attr('class', 'color-key')
			.attr('x', -colorKeySize - 4)
			.attr('y', -7)
			.attr('width', colorKeySize)
			.attr('height', colorKeySize);
	}

	/*
	*/
	Livsloner.prototype.updateDesktopLabels = function(args) {
		var self;
		if (args) {
			if (args.self) {
				self = args.self;
			}
		}
		else {
			self = this;
		}

		var newLabelGroups = self.enteringLineGroups
			.append('g')
			.attr('class', 'label-group')
			.attr('transform', function(d) {
				var x = self.width;
        		var y = self.y(d.finalSalary);
				return 'translate('+[x, y]+')';
			});

		newLabelGroups.append('text')
			.each(function(d) {
				var str = addLineBreaks(d.label, 15);
				addLineBreaksToSVG(str, this)					
			})
			.attr('transform', 'translate(19,5)');

		newLabelGroups.append('line')
			.attr('class', 'label-line')
			.attr('x1', 4)
			.attr('x2', 15)
			.attr('y1', 0)
			.attr('y2', 0);

		self.lineGroups.sort(function(a,b){
    		return b.finalSalary - a.finalSalary;
    	})
    	var bottomYOfPreviousLabel = -99999;
    	var prevHeight = 0;
    	var prevY = -99999;
		self.lineGroups.selectAll('.label-group').each(function(d) {
			var elem = elem = d3.select(this);
			var y0 = self.y(d.finalSalary);
			var diff = y0 - prevY;
			var offsetY;
			if (diff>prevHeight) {
			  offsetY = 0;
			}
			else {
			  offsetY = prevHeight - diff + 3;
			}
			prevY = y0 + offsetY;
			
			elem.transition()
				.duration(300)
				.attr('transform', 'translate('+ [self.width, y0 + offsetY] +')');

			elem.select('line').transition()
				.duration(300)
				.attr('y1', -offsetY);
			prevHeight = elem.select('text').node().getBoundingClientRect().height;
			

		});
	};

	/*	Cleared everything classed annotation.
	*/
	Livsloner.prototype.removeAnnotation = function() {
		var self = this;
		self.chart.selectAll('.annotation').remove();
		self.chart.selectAll('.profession-line').classed('highlighted', false);
		self.sentenceContainer.classed('hidden', true);
		self.sentenceContainer.selectAll('.body, .header').html('');
	};

	Livsloner.prototype.update = function() {
		var self = this;

		// Get selected professions
		var selectedProfessions = getSelectedProfessions();
		// Add baseline
		if (selectedProfessions.length) {
			var column = getBaseLineColumn(selectedProfessions);
			selectedProfessions.unshift( {
				label: getBaseLineLabel(column),
				column: column 
			});	
		}

		self.container.classed('no-selection', selectedProfessions.length == 0);

		// Get selected columns from data
		var lineData = getDataPoints(self.data, selectedProfessions);

		self.lineGroups = self.chart.selectAll('g.line-group')
			.data(lineData, function(d) { return d.column; });

		// Remove exiting lines
		self.removeAnnotation();

		// Add break even after lines are drawn if there is only one line (+ baseline)
		var callbacks = [];
		if (!self.mobile) {
			callbacks.push({
				fn: self.updateDesktopLabels,
				args: { self: self }
			})
		}
		if (lineData.length == 2) {
			self.breakEven = getBreakEvenPoint(lineData[0], lineData[1]);
			self.finalSalaries = getFinalSalaries(lineData[0], lineData[1]);

			callbacks.push({
				fn: self.updateBackgroundArea,
				args: { self: self }
			},
			{ 
				fn: self.addBreakEven,
				args: { self: self }
			}, 
			{
				fn: self.addSentence,
				args: { self: self }
			});

			// Highligt the final salary diff in mobile
			if (self.mobile) {
				callbacks.push({
					fn: self.annotateDifference,
					args: { self: self }
				},
				{
					fn: self.annotateLines,
					args: { self: self }
				});	
			}
			else {
				callbacks.push({
					fn: self.highlightSelectedProfession,
					args: { self: self }
				})
			}
			


			/* 	Show break even also if we move from multiple selected to two.
				In those cases there won't be any animations, and therefore no animation
				callbacks.
			*/
			var numberOfEnteringLines = self.lineGroups.enter()[0].filter(function(d) { return d; }).length;
			if (numberOfEnteringLines == 0) {
				run(callbacks);
			}
		}

		/* Tell parent that height has changed
		*/
		callbacks.push({ fn: app.sendHeight });

		// Draw lines
		self.updateLines(callbacks);


	};
	// UTIILITY FUNCTIONS
	var getSelectedProfessions = function() {
		var selectedProfessions = [];
		if (app.mobile) {
			var value = $('.profession').val();
			if (value) {
				selectedProfessions.push(value);
			}
		}
		else {
			$('.profession:checked').each(function() {
				selectedProfessions.push( $(this).val() );
			});	
		}
		return selectedProfessions.map(function(d) {
			var values = d.split('|');
			return {
				label: values[0],
				column: values[1],
				baseline: values[2]
			}
		});
	}

	var getDataPoints = function(data, selectedProfessions) {
		return selectedProfessions.map(function(profession) {
			return {
				column: profession.column,
				label: profession.label,
				finalSalary: data[data.length - 1][profession.column],
				values: data.map(function(d) {
					return {
						age: d.alder,
						salary: d[profession.column]
					};
				})
			}
		});
	}

	var getBaseLineColumn = function(selectedProfessions) {
		var baselines = selectedProfessions.map(function(profession) {
			return profession.baseline;
		});
		return baselines.allValuesSame() ? baselines[0] : 'GymnTotal';
	}
	var getBaseLineLabel = function(column) {
		if (column == 'GymnSamhv') {
			return 'Samhällsvetenskapligt gymnasieutbildad';
		}
		else if (column == 'GymnNatv') {
			return 'Naturvetenskapligt gymnasieutbildad';
		}
		else {
			return 'Gymnasieutbildad';
		}
	}

	var getBreakEvenPoint = function(baseline, professionLine) {
		for (var i = 0; i < baseline.values.length; i++) {
			var baselineValue = baseline.values[i].salary;
			var salary = professionLine.values[i].salary;
			if (salary > baselineValue) {
				return baseline.values[i];
			}
		}
		// Salary projection never passes baseline
		return false;
	}

	var getSentence = function(breakEven, finalSalaries) {
		var str = '';
		var comparator;
		var baselineLabel = finalSalaries.baselineLabel.toLowerCase();
		var professionLabel = finalSalaries.professionLabel.toLowerCase()
			.replace('akademiker, totalt', 'genomsnittlig akademiker')
			.replace('social omsorg', 'utbildad inom social omsorg')
			.replace('organisation, administration & förvaltning', 'utbildad inom organisation, administration och förvaltning');
		var isBaseline = finalSalaries.baseline == finalSalaries.profession;
		var differencePercent = Math.abs(1 - finalSalaries.profession / finalSalaries.baseline );
		if (isBaseline) {
			str += 'En ' +baselineLabel+' person utan högre utbildning får i snitt en livslön på <strong>' + formatInSentence(finalSalaries.profession) + '</strong>.';
		}
		else {			
			if (breakEven) {
				str = 'Vid <strong>' + breakEven.age + ' års ålder</strong> har en ' + professionLabel + ' tjänat in sin utbildning.';
				comparator = 'mer';
			}
			else {
				str += 'En ' + professionLabel + ' tjänar aldrig in sin utbildning.';
				comparator = 'mindre';
			}
			str += ' Livslönen för en ' + professionLabel + ' är <strong>' + formatInSentence(finalSalaries.profession) + ' kronor</strong>';

			if (Math.round(differencePercent * 100) == 0) {
				str += ', vilket är ungefär <strong>lika mycket</strong> som en ' + baselineLabel;
			}
			else {
				str += ', vilket är cirka <strong>'+ formatPercentInSentence(differencePercent) +' ' + comparator + ' </strong> än genomsnittet för en ' + baselineLabel + '.';
			}
		}
		
		return str;

	}

	// Get the final salaries of baseline and profession in compare mode
	var getFinalSalaries = function(baseline, professionLine) {
		return {
			baseline: baseline.finalSalary,
			baselineLabel: baseline.label,
			profession: professionLine.finalSalary,
			professionLabel: professionLine.label,
			difference: professionLine.finalSalary - baseline.finalSalary
		}
	}
	// Invoke callback when all d3 animations are done
	var transitionEnd = function(transition, callback) { 
	   var n = 0; 
	   transition 
	       .each(function() { ++n; }) 
	       .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
	 }
	 var addLineBreaks = function(str, characterThreshold) {
	 	var characterThreshold = characterThreshold || 20;
	 	var arr = str.split(' ');
	 	var counter = 0;
	 	var newStr = '';
	 	arr.forEach(function(d) {
	 		if (counter + d.length > characterThreshold) {
	 			counter = 0;
	 			delimiter = '\n';
	 		}
	 		else {
	 			counter = counter + d.length;
	 			delimiter = ' ';
	 		}
	 		newStr += (d + delimiter)
	 	})
	 	return newStr;
	 }
	 var addLineBreaksToSVG = function(str, elem) {
	 	var arr = str.split("\n");
	 	if (arr != undefined) {
	 	    for (i = 0; i < arr.length; i++) {
	 	        d3.select(elem).append("tspan")
	 	            .text(arr[i])
	 	            .attr("dy", i ? "1.2em" : 0)
	 	            .attr("x", 0)
	 	            .attr("class", "tspan" + i);
	 	    }
	 	}
	 }

	 var run = function(callbacks) {
	 	callbacks.forEach(function(callback) {
	 		callback.fn(callback.args);
	 	})
	 }

	return Livsloner;
})();