/*
 * remove the entity tag for the "entities" that have no scraped data
 */
function removeEntitiesWithNoData(aDataset) {

	var nameOfTextFile = getTextFileName();

	$('.entity').each(function(index, value) {
		// does entity have data available?
		anEntity = $.trim(d3.select(value).html())

		if (aDataset != 'eyetracking') {
			var theDataset = eval(aDataset)
			if ((typeof theDataset[nameOfTextFile][anEntity] === 'undefined') || (theDataset[nameOfTextFile][anEntity].length === 0)) {
				// console.log(anEntity)
				// no data available remove the entity tag
				$(value).contents().unwrap();
			}
		} else {
			anEntity = anEntity + 'varifocalReader';
			if ((typeof resultsHashTable[anEntity] === 'undefined') || (resultsHashTable[anEntity].length === 0)) {
				$(value).contents().unwrap();
			}
		}

	});
}



function addEntitiesAtRandomPosition(containerSelector, numberOfWsv) {

	var theText = $(containerSelector).text();
	var cleanedText = $.map(theText.split('\n'), function(value, index) {
							value = value.trim()
							if (value != '\n' && value != '' && value != ' ') {
								return '<p>' + value + '</p>';
							}
						}).join(' ');


	var words = cleanedText.split(' ');

	var numberOfWords = words.length;

	// uniform sample of integers between 1 and numberOfWords
	var r = dl.random.integer(1,numberOfWords);
	var indexArray = r.samples(numberOfWsv);

	while ((new Set(indexArray)).size !== indexArray.length) {
		indexArray = r.samples(numberOfWsv);
	}


	var newString = $.map(words, function(valueWords, indexWords) {

		$.each(indexArray, function(indexSample, valueSample) {
			if (indexWords == valueSample) {

				if ((valueWords.indexOf('<p>') > -1) && (valueWords.indexOf('</p>') < 0) ) {
					var without_p = valueWords.substring(3);
					valueWords = "<p><span class='entity'>" + without_p + '</span>';
				} else if ((valueWords.indexOf('</p>') > -1) && valueWords.indexOf('<p>') < 0) {
					var without_p = valueWords.substring(0,valueWords.length-4);
					valueWords = "<span class='entity'>" + without_p + '</span>';
				} else {
					valueWords = "<span class='entity'>" + valueWords + '</span>';
				}
			}
		});

		return valueWords;

	}).join(' ');


	$(containerSelector).html(newString);
}


function addAttrAndEventsToEntities() {

	// var tmpCurrentEntity;

	// instead of mouseover use mouseenter and mouseleave, see http://stackoverflow.com/questions/6274495/changing-opacity-with-jquery
	$('.entity').mouseenter(function(event) {
		// show contextual menu

		console.log('mouseenter');

		if ((layoutFlag && $(this).hasClass('currentEntity')) || !layoutFlag) {

			if (tmpCurrentEntity !== this) {
				console.log('show contextual menu');

				showContextMenu(this);
				addUsabilityToMenu(this);

				// logStudyEvent('menu_interaction', {'interaction_type': 'show menu', 'entity': this.innerText})
			}

			tmpCurrentEntity = this;
		}
	});


// TODO this lower part needs to move
	$.each(contextualMenuIcons, function(index, value) {

		var iconName = $(value).attr('id');

		$(value).click(function() {
			console.log('event: single click on ' + iconName + ' layout');

			unSelectIcon();

			// close menu does not need visual feedback for having been selected
			if (nonLayoutIcons.indexOf('#' + iconName) === -1) {
				$(value).addClass('currentSeletedLayout');
			}


			// if (iconName === 'clear-sparkline') {
			//
			// 	clearSparkline(tmpCurrentEntity);
			//
			// } else
			// if (iconName === 'order-by-entity-name-asc') {
			//
			// 	entityNameSort();
			// 	updatelayout();
			//
			// } else
			// if (iconName === 'brushed-linking') {
			//
			// 	// randomSort();
			// 	entityNameSort();
			// 	updatelayout();
			//
			// } else
			if (iconName === lastDataValue_sort) {

				// maxSort();
				lastValueSort()
				updateLayout('lastValue');

				// logStudyEvent('sorting', {'sorting_type': 'by-lastDataValue'})

			} else if (iconName === entityName_sort) {

				// minSort();
				entityNameSort()
				updateLayout('entityName');

				// logStudyEvent('sorting', {'sorting_type': 'by-entityName'})

			} else if (iconName === docPosition_sort) {

				// minSort();
				docPositionSort()
				updateLayout('docPosition');

				// logStudyEvent('sorting', {'sorting_type': 'by-docPosition'})

			} else if (iconName === close_interaction) {

				// hideContextualMenu();

				// remove the spacer, only for grid-no-overlap
				if ($('#spacer').length > 0) {
					removeSpacer();
				}

				giveUpLayout();
				startMenuHideTimer();
				cleanupAfterLayout();
				clearSelection();
				// unHideCloseIcon();
				// resetLayoutIcon();

				if (condition !== study2) {
					hideCloseIcon();
				}

				addUsabilityToMenu(tmpCurrentEntity);

				// logStudyEvent('menu_interaction', {'interaction_type': 'closing menu using close button'})
				// logStudyEvent('gathering', {'interaction_type': 'layout dissipated by using close button'})

			} else if (iconName === select_interaction) {

				// if ($(tmpCurrentEntity).hasClass('showInLayout')) {
				// 	$(tmpCurrentEntity).removeClass('showInLayout')
				// 	// unselect selector box
				// 	$('#selector').removeClass('hide');
				// 	$('#selector-ok').addClass('hide');
				// } else {
					// select selector box
				$(tmpCurrentEntity).addClass('showInLayout')

				$('#selector-ok').removeClass('hide');
				$('#selector').addClass('hide');
				// }

				var entityName = tmpCurrentEntity.innerText;
				// logStudyEvent('menu_interaction', {'interaction_type': 'select the entity (selector)', 'entity': entityName})

			} else if (iconName === unselect_interaction) {

				$(tmpCurrentEntity).removeClass('showInLayout')
				// unselect selector box
				$('#selector').removeClass('hide');
				$('#selector-ok').addClass('hide');

				var entityName = tmpCurrentEntity.innerText
				// logStudyEvent('menu_interaction', {'interaction_type': 'unselect the entity (selector-ok)', 'entity': entityName});

			} else {
				// click on a layout icon

				// add the class 'selected' if no wsv has been selected
				if (!($('.entity.selected').length > 1)) {
					$('.entity').addClass('selected');
				}

				if (iconName !== layoutType) {

					console.log('set layout to "' + iconName + '"')

					if (currentEntity === null || currentEntity === undefined) {
						set_currentEntity(tmpCurrentEntity);
					}

					changeLayout(iconName);

					// update stored entityBbox measurements
					if (layoutType === gridNoOverlap_layout) {
						updateEntityBBox()
					}

					// $('.entity').sparklificator('option', 'environment', 'only_cloned')

					add_SuggestedInteractivity(iconName);

					layoutFlag = true;
					setLayoutType(iconName, 'newLayout');

					makeSelectable('sorting');
					makeNotSelectable('selection');

					// if (condition != study2) {
					hideLayoutIcon();
					// }
					// } else {
					// 	unHideCloseIcon();
					// }

					// if (layoutType === 'row') {
					// 	updateOrientationCircles();
					// }



					// logStudyEvent('menu_interaction', {'interaction_type': 'clicked on button ' + iconName})

				} else {
					console.log('there is already a layout');
				}
			}

			hideContextualMenu();
		});
	});


	$('.entity').mouseleave(function() {

		console.log('mouseleave');
		startMenuHideTimer();
	});
}


function clearSparkline(theEntity) {
	// remove all added data keep only data with ID 0

	var dataFirstElement = d3.select($(theEntity).next()[0]).select('g.wsv#ID_0').data();

	var dataDraggedElement = d3.select($(theEntity).next()[0]).select('g.wsv#ID_1').datum();

	var sourceElement = dataDraggedElement.draggedElement;

	// change source wsv color
	var color = d3.scale.category10()
			.domain([0,1]);
	d3.select(sourceElement[0]).select('path.sparkline').style('stroke', color(0));

	classicSparkline($(theEntity).next(), (widthMarkLineChart * numberOfMarks), heightWordScaleVis, false, 'not_cloned', dataFirstElement);

}



function addWSV(typeOfWSV, aDataset) {

	var nameOfTextFile = getTextFileName();

	$('.entity').each(function(index, value) {
		// each wsv gets different data
		var settings;
		if (typeOfWSV === 'barChart') {

			settings = {data: generateRandomDataForBarChart(numberOfMarks, 10, 60),
						renderer: barChart,
						position: positionType,
						paddingWidth: true,
						paddingHeight: true,
						width: (widthMarkBarChart*numberOfMarks),
						height: heightWordScaleVis };

		} else if (typeOfWSV === 'lineChart') {

			var theData;
			anEntity = $.trim(d3.select(value).html())
			// console.log(anEntity);
			// if (stockData[d3.select(value).html()].length == 0) {
			var theDataset = eval(aDataset);
			if ((typeof theDataset[nameOfTextFile][anEntity] !== 'undefined') && (theDataset[nameOfTextFile][anEntity].length !== 0)) {
				// only add a wsv if we have scraped data
			// 	theData = generateRandomDataForBarChart_study(numberOfMarks, 10, 60);
			// } else {

				// sort the stockData array
				var transformedStockData = theDataset[nameOfTextFile][anEntity].map(function(element) {
					return {close: element.changeToFirst, date: new Date(element.date)};
				});

        transformedStockData.sort(function(a, b) {
          return a.date - b.date;
        });

        // sorted data, ascending
        theData = [{id: 0, values: transformedStockData}];
      }


      settings = {data: theData,
						renderer: stockPriceSparkline,
						// renderer: classicSparkline,
						position: positionType,
						paddingWidth: true,
						paddingHeight: true,
						width: (widthMarkLineChart*numberOfMarks),
						height: heightWordScaleVis };

		} else if (typeOfWSV === 'timeline') {

			var theData;
			anEntity = $.trim(d3.select(value).html())

			var theDataset = eval(aDataset);
			if ((typeof theDataset[nameOfTextFile][anEntity] !== 'undefined') && (theDataset[nameOfTextFile][anEntity].length !== 0)) {

				const startPointDate = Date.parse('1 January 1850');
				// const endPointDate = Date.parse('1 January 1970');

				let dataObject = theDataset[nameOfTextFile][anEntity];
				let startDate = Date.parse(dataObject.dates[0]);
				let endDate = Date.parse(dataObject.dates[1]);

				dataObject.numberOfDays = Math.round((endDate - startDate)/(1000*60*60*24))
				dataObject.startPoint = Math.round((startDate - startPointDate)/(1000*60*60*24))

				theData = dataObject;
      }

			const widthWiki = 150;
			const heightWiki = 20;

      settings = {data: theData,
									renderer: buildWikiChart,
									position: positionType,
									paddingWidth: true,
									paddingHeight: true,
									width: widthWiki,
									height: heightWiki };

		} else if (typeOfWSV === 'eyetracking') {

			var theData;
			var anEntity = $.trim(d3.select(value).html()) + 'varifocalReader';

			// from ETSparklines
			var fixationData = new Array();
			resultsHashTable[anEntity].forEach(function(item) {
				if (item.selected == "yes") {
        	fixationData.push(item);
        }
			});


			if (fixationData.length > 0) {
				var stimuliName = fixationData[0].stimuliname
				var listAOIs = aois[stimuliName];
				// colorScales[fixationData[0].stimuliname] = defineColorScale(visualizationType, fixationData, listAOIs);
				// chooseGrayScale(fixationData);

				var aStimuliSizes = theStimuliSizes[stimuliName]

				theData = {fixationData: fixationData, stimuliSizes: aStimuliSizes}

				// draw(graph, fixationData, visualizationType, listAOIs, (stimuliSize[fixationData[0].stimuliname])[0], (stimuliSize[fixationData[0].stimuliname])[1]);
			}

			// from ETSparklines


			const widthEyeTrackSpark = 100;
			const heightEyeTrackSpark = 20;

			settings = {data: theData,
									renderer: eyetrackingWSV,
									position: positionType,
									paddingWidth: true,
									paddingHeight: true,
									width: widthEyeTrackSpark,
									height: heightEyeTrackSpark };
		}

		$(value).sparklificator();
		$(value).sparklificator('option', settings);
	});

	// add event handler for mouseenter on the sparkline when there is no layout
	$('span.sparkline').mouseenter(function() {

		if (!layoutFlag) {
			console.log('brushing and linking possibly started');

			var entityOfBrushing = $(this).parent().children('.entity').text().trim();
			// logStudyEvent('brushing and linking', {'interaction_type': 'started a possible brushing and linking interaction', 'where': 'not on gathered wsv', 'entity': entityOfBrushing});
		}
	});

	// add event handler for mouseleave on the sparkline when there is no layout
	$('span.sparkline').mouseleave(function() {
		if (!layoutFlag) {
			console.log('brushing and linking ended');

			var entityOfBrushing = $(this).parent().children('.entity').text().trim();
			// logStudyEvent('brushing and linking', {'interaction_type': 'terminated a possible brushing and linking interaction', 'where': 'not on gathered wsv', 'entity': entityOfBrushing});
		}
	});
}


// adds drag and drop funcitonality
function addDraggingFunctionality() {

	// $('.sparklificated').addClass('droptarget');


	var sourceElement;

	$('span.sparkline').draggable({
		cursor: 'move',
		revert: 'invalid',
		helper: 'clone',

		zIndex: 30,	// sets the helper to that z-index

		start: function(event, ui) {

			action = true;

			sourceElement = $(this);

			// sourceElement.css('z-index', 20);
		},


		stop: function(event, ui) {
			// no drop happened
			$('svg.diffLine').remove();

			action = false;
		},


		drag: function(event, ui) {

			var sourcePosition = {};
			var bboxSource = $(sourceElement)[0].getBoundingClientRect();

			sourcePosition.left = bboxSource.left;
			sourcePosition.width = bboxSource.width;
			sourcePosition.height = bboxSource.height;
			sourcePosition.top = $(window).scrollTop() + bboxSource.top;	// + bboxSource.height/2.0;

			var draggedPosition = {};
			draggedPosition.left = ui.offset.left;
			draggedPosition.width = bboxSource.width;
			draggedPosition.height = bboxSource.height;
			draggedPosition.top = ui.offset.top;	// + bboxSource.height/2.0;

			// draw_diffLine(sourcePosition, draggedPosition)
			draw_connection_line('diffLine', sourcePosition, draggedPosition)
		}
	});


	$('span.sparkline').droppable({
		classes: {
			'ui-droppable-hover': 'comparisonPossible'
		},

		drop: function(event, ui) {

			console.log('dropped on target');
			// console.log('targetElement ' + $(this).prev().text());

			var newDataArray = [];

			var targetElement = $(this);
			var draggedElement_data = d3.select(sourceElement[0]).selectAll('g.wsv').data()[0].values;
			// console.log(draggedElement_data);
			// var targetElement_data = d3.select(this).selectAll('g.wsv').data()[0];
			// newDataArray.push(targetElement_data);
			// newDataArray.push({id: targetElement_data.length++, values: draggedElement_data});

			// mark entity as being diffed
			targetElement.prev().addClass('diffed');

			var targetElement_data = d3.select(this).selectAll('g.wsv').data();
			// newDataArray.push(targetElement_data);

			if (targetElement_data.length < 2) {
				$.each(targetElement_data, function(i, v) {
					newDataArray.push(v);
				})

				var newID = targetElement_data.length++;
				newDataArray.push({id: newID, values: draggedElement_data, draggedElement: sourceElement});


				if (d3.select(this).select('svg').classed('barChart')) {

					barChart(targetElement, (widthMarkBarChart * newDataArray.length * numberOfMarks), heightWordScaleVis, false, newDataArray);

				} else if (d3.select(this).select('svg').classed('lineChart')) {

					classicSparkline(targetElement, (widthMarkLineChart * numberOfMarks), heightWordScaleVis, false, 'not_cloned', newDataArray);

					// successfull drop
					var thePaths = d3.select(targetElement[0]).selectAll('path.sparkline')[0];
					var lastAddedPath = d3.select(targetElement[0]).selectAll('path.sparkline')[0][thePaths.length-1];
					lastAddedPath_color = d3.select(lastAddedPath).style('stroke');

					d3.select(sourceElement[0]).select('path.sparkline').style('stroke', lastAddedPath_color);

				}
			}

			// sourceElement.css('z-index', 3)

			// when element is dropped remove the diffLine
			$('svg.diffLine').remove();

			action = false;
		}
	});
}



function generateRandomDataForBarChart(numberOfBars, minVal, maxVal) {

	// uniform sample of integers between 1 and numberOfWords
	var r = dl.random.integer(minVal, maxVal);

	return [{id: 0, values: r.samples(numberOfBars)}];
}

function generateRandomDataForBarChart_study(numberOfBars, minVal, maxVal) {

	// uniform sample of integers between 1 and numberOfWords
	var r = dl.random.integer(minVal, maxVal);
	var theValues = r.samples(numberOfBars).map(function(element) {
		return {close: element}
	})

	return [{id: 0, values: theValues}];
}


function set_currentEntity(entity) {

	if (currentEntity != undefined) {
		$(currentEntity).removeClass('currentEntity');
	}

	currentEntity = entity;
	$(currentEntity).addClass('currentEntity');
	$(currentEntity).next('.sparkline').addClass('currentEntity');
	$(currentEntity).css('z-index', 6);

	if ($(currentEntity).hasClass('selected')) {
		$(currentEntity).removeClass('selected');
	}
}


// random current entity has to be in the viewport
function set_randomCurrentEntity() {
	var randomNumber = _.random(1, numberOfEntities);

	var randomCurrentEntity = $('.entity')[randomNumber];

	// only select an entity as current if it is visible (visible part of the browser window)
	while ((randomCurrentEntity.getBoundingClientRect().top < 0) || (randomCurrentEntity.getBoundingClientRect().top > window.innerHeight)) {

		randomNumber = _.random(1, numberOfEntities);
		randomCurrentEntity = $('.entity')[randomNumber];
	}

	set_currentEntity(randomCurrentEntity);
}

// get the closest entity to the dbclicked location
function set_closestEntityAsCurrentEntity(clickLocation) {

	// return only visible entities
	var visibleEntities = $('.entity').filter((index, anEntity) => anEntity.getBoundingClientRect().top > 0 && anEntity.getBoundingClientRect().top < window.innerHeight);

	// calculate for remaing ones the closes one
	var closestEntity = null;
	var closestDistance = 1000000;
	visibleEntities.each(function(index, theEntity) {
		var distance = getDistancePointClosestWSVCorner(clickLocation, theEntity)

		if (distance < closestDistance) {
			closestEntity = theEntity;
			closestDistance = distance;
		}
	});

	set_currentEntity(closestEntity);
}


/**
 * Gets the distance between a point and the center of the entity
 * @param  {[type]} point  [description]
 * @param  {[type]} entity [description]
 * @return {number}        The distance
 */
function getDistanceBetweenPointEntity(point, entity) {

	// entities are DOM elements
	var wsvBBox = get_BBox_wsv_NEW($(entity).parent(), positionType);

	console.log(wsvBBox)

	var centerEntityBBox = {'left': wsvBBox.left + (wsvBBox.width / 2.0), 'top': wsvBBox.top + (wsvBBox.height / 2.0)};
	console.log(centerEntityBBox);

	console.log((point.x - centerEntityBBox.left) * (point.x - centerEntityBBox.left))
	console.log((point.y - centerEntityBBox.top) * (point.y - centerEntityBBox.top))

	var squaredDistance = ((point.x - centerEntityBBox.left) * (point.x - centerEntityBBox.left)) + ((point.y - centerEntityBBox.top) * (point.y - centerEntityBBox.top));
	console.log(squaredDistance);

	return squaredDistance;
}


/**
 * Gets the shortest distance between a point and the closest poinnt on the bbox of the wsv
 * @param  {[type]} point  [description]
 * @param  {[type]} entity [description]
 * @return {number}        shortest ditance between the corner closest to the point and the point
 */
function getDistancePointClosestWSVCorner(point, entity) {
	// entities are DOM elements
	var wsvBBox = get_BBox_wsv_NEW($(entity).parent(), positionType);

	// console.log(wsvBBox)

	// var wsvCorners = {'topLeft': {'left': wsvBBox.left, 'top': wsvBBox.top},
	// 									'topRight': {'left': wsvBBox.left + wsvBBox.width, 'top': wsvBBox.top},
	// 									'bottomLeft': {'left': wsvBBox.left, 'top': wsvBBox.top + wsvBBox.height},
	// 									'bottomRight': {'left': wsvBBox.left + wsvBBox.width, 'top': wsvBBox.height}};

	// does not matter which corner --> array of corner and not object
	var wsvCorners = [{'left': wsvBBox.left, 'top': wsvBBox.top},
										{'left': wsvBBox.left + wsvBBox.width, 'top': wsvBBox.top},
										{'left': wsvBBox.left, 'top': wsvBBox.top + wsvBBox.height},
										{'left': wsvBBox.left + wsvBBox.width, 'top': wsvBBox.top + wsvBBox.height}];

	// console.log(wsvCorners);

	// console.log((point.x - centerEntityBBox.left) * (point.x - centerEntityBBox.left))
	// console.log((point.y - centerEntityBBox.top) * (point.y - centerEntityBBox.top))

	var squaredDistance = 10000000;

	wsvCorners.forEach(function(aCorner) {
		var newSquaredDistance = ((point.x - aCorner.left) * (point.x - aCorner.left)) + ((point.y - aCorner.top) * (point.y - aCorner.top));
		// console.log(newSquaredDistance);

		if (newSquaredDistance < squaredDistance) {
			squaredDistance = newSquaredDistance
		}
	});

	if (point.x > wsvBBox.left && point.x < wsvBBox.left + wsvBBox.width) {
		var distanceToSegmentTop = Math.abs(point.y - wsvBBox.top);
		var distanceToSegmentBottom = Math.abs(point.y - (wsvBBox.top + wsvBBox.height));

		var distanceToSegmentTop_squared = distanceToSegmentTop * distanceToSegmentTop;
		if (distanceToSegmentTop_squared < squaredDistance) {
			squaredDistance = distanceToSegmentTop_squared;
		}

		var distanceToSegmentBottom_squared = distanceToSegmentBottom * distanceToSegmentBottom;
		if (distanceToSegmentBottom_squared < squaredDistance) {
			squaredDistance = distanceToSegmentBottom_squared;
		}

	} else if (point.y > wsvBBox.top && point.y < wsvBBox.top + wsvBBox.height) {
		var distanceToSegmentLeft = Math.abs(point.x - wsvBBox.left);
		var distanceToSegmentRight = Math.abs(point.x - (wsvBBox.left + wsvBBox.width));

		var distanceToSegmentLeft_squared = distanceToSegmentLeft * distanceToSegmentLeft;
		if (distanceToSegmentLeft_squared < squaredDistance) {
			squaredDistance = distanceToSegmentLeft_squared;
		}

		var distanceToSegmentRight_squared = distanceToSegmentRight * distanceToSegmentRight;
		if (distanceToSegmentRight_squared < squaredDistance) {
			squaredDistance = distanceToSegmentRight_squared;
		}
	}

	// var squaredDistance = ((point.x - centerEntityBBox.left) * (point.x - centerEntityBBox.left)) + ((point.y - centerEntityBBox.top) * (point.y - centerEntityBBox.top));
	// console.log(squaredDistance);

	return squaredDistance;
}


function cloneEntityWithWSV(theEntity, theMiddleBoundOffset, theOffset_whitelayer, originalIndex) {

	var theData;

	var settings;
	if (typeOfWSV === 'barChart') {

		theData = d3.select(theEntity[0].parentElement).selectAll('g.wsv').data();

		settings = {data: theData,
					renderer: barChart,
					position: positionType,
					paddingWidth: true,
					paddingHeight: true,
					// width: (widthMarkLineChart*numberOfMarks*theData.length),
					width: (widthMarkLineChart*numberOfMarks),
					height: heightWordScaleVis };

	} else if (typeOfWSV === 'lineChart') {

		// theData = d3.select(element.wsv).selectAll('g path').data()[0];
		theData = d3.select(theEntity[0].parentElement).selectAll('g.wsv').data()

		settings = {data: theData,
					//renderer: classicSparkline,
					renderer: stockPriceSparkline,
					position: positionType,
					paddingWidth: true,
					paddingHeight: true,
					// width: (widthMarkLineChart*numberOfMarks*theData.length),
					width: (widthMarkLineChart*numberOfMarks),
					height: heightWordScaleVis };

	} else if (typeOfWSV === 'timeline') {

		theData = d3.select(theEntity[0].parentElement).selectAll('g.wsv').data()[0];

		const widthWiki = 100;
		const heightWiki = 20;

    settings = {data: theData,
								renderer: buildWikiChart,
								position: positionType,
								paddingWidth: true,
								paddingHeight: true,
								width: widthWiki,
								height: heightWiki };
	} else if (typeOfWSV === 'eyetracking') {

//!!!!! to fix
		// theData = d3.select(theEntity[0].parentElement).selectAll('g.wsv').data()

		var theData;
		var anEntity = $.trim(theEntity.text()) + 'varifocalReader';

		// from ETSparklines
		var fixationData = new Array();
		resultsHashTable[anEntity].forEach(function(item) {
			if (item.selected == "yes") {
      	fixationData.push(item);
      }
		});


		if (fixationData.length > 0) {
			var stimuliName = fixationData[0].stimuliname
			var listAOIs = aois[stimuliName];
			// colorScales[fixationData[0].stimuliname] = defineColorScale(visualizationType, fixationData, listAOIs);
			// chooseGrayScale(fixationData);

			var aStimuliSizes = theStimuliSizes[stimuliName]

			theData = {fixationData: fixationData, stimuliSizes: aStimuliSizes}

			// draw(graph, fixationData, visualizationType, listAOIs, (stimuliSize[fixationData[0].stimuliname])[0], (stimuliSize[fixationData[0].stimuliname])[1]);
		}

		const widthEyeTrackSpark = 100;
		const heightEyeTrackSpark = 20;

		settings = {data: theData,
					renderer: eyetrackingWSV,
					position: positionType,
					paddingWidth: true,
					paddingHeight: true,
					width: widthEyeTrackSpark,
					height: heightEyeTrackSpark };


	}

	var clonedEntity = theEntity.clone();
	clonedEntity.insertAfter(theEntity[0].parentElement);
	clonedEntity.addClass('clonedWSV');

	clonedEntity.sparklificator();
	clonedEntity.sparklificator('option', settings);

	var clonedSparklificated = clonedEntity.parent();

	clonedSparklificated.css('z-index', 6);


	// the values for x_value and y_value are all 'auto' because they are not yet positioned
	var x_value = d3.select(clonedSparklificated[0]).style('left');
	var y_value = d3.select(clonedSparklificated[0]).style('top');
	var theZindex = d3.select(clonedSparklificated[0]).style('z-index');

	var measurements = {x: x_value, y: y_value, middleBoundOffset: theMiddleBoundOffset, offset_whiteLayer: theOffset_whitelayer, originalIndex: originalIndex, zIndex: theZindex};


	// add the centroid to the data attribute of clonedSparklificated
	d3.select(clonedSparklificated[0])
		.datum(measurements);

	clonedSparklificated.addClass('clonedWSV');

	clonedSparklificated.children('.sparkline').addClass('clonedWSV');

	if (allowedInteractions.includes('lineToWSVOrigin')) {
		// changed the hover from sparklificated to the entity
		clonedSparklificated.children('.entity.clonedWSV').hover(function(element) {

			console.log('mouseenter event triggered');

			// draw_trails_whenHover(clonedSparklificated);
			draw_connection_line('hoveringTrail', clonedSparklificated, null)

			// logStudyEvent('hovering', {'interaction_type': 'hover over entity', 'entity': clonedSparklificated[0].textContent.trim().split(' ')[0].trim()});

		}, function() {
			removeTrail();
		});


		// when hoverin over an entity in the layout but then do a mouse down (first part of click) the trail has to be removed
		clonedSparklificated.children('.entity.clonedWSV').mousedown(function() {
			console.log('element has been clicked');

			removeTrail();
		});
	}

	// adding mouseenter event to clonedwsv sparkline
	clonedSparklificated.children('.sparkline.clonedWSV').mouseenter(function() {
		console.log('clonedWSV: brushing and linking possibly started');

		var entityOfBrushing = $(this).parent().children('.entity').text().trim();
		// logStudyEvent('brushing and linking', {'interaction_type': 'started a possible brushing and linking interaction', 'where': 'on gathered wsv', 'entity': entityOfBrushing});
	});

	// adding mouseenter event to clonedwsv sparkline
	clonedSparklificated.children('.sparkline.clonedWSV').mouseleave(function() {
		console.log('clonedWSV: brushing and linking possibly ended');

		var entityOfBrushing = $(this).parent().children('.entity').text().trim();
		// logStudyEvent('brushing and linking', {'interaction_type': 'terminated a possible brushing and linking interaction', 'where': 'on gathered wsv', 'entity': entityOfBrushing});
	})



	// dragging for diff this is connected to the sparkline
//TODO might still be needed	// d3.select(clonedSparklificated.children('.sparkline.clonedWSV')[0]).call(dragForDiff);


//TODO how to decide which drag to do (drag-to-swap), (drop dragged item inbetween) or (diff-drag)
//TODO "drop dragged item inbetween", means a dragging, depending on the positioning, dragged element is moved between target element and previous elements or moved between target and following elements; when doing the move check if there is enough space; it means some cloned wsv will move back or forth

	// change the font size of clonedWSV entity
	// $('.clonedWSV .entity').css('font-size', 12);


//TODO use as inspiration:
//		function connect(el1, el2, color, datum) { // draw a line connecting elements
	    	// var off1 = getOffset(el1);
	    	// var off2 = getOffset(el2);
	    	// var thickness = 20;
	    	// // bottom right
	    	// //var x1 = off1.left + off1.width;
	    	// var x1 = Math.max(0, d3.event.pageX) + 1;
	    	// var y1 = off1.top + off1.height * 3 / 4;
	    	// // top right
	    	// var x2 = off2.left;
	    	// var y2 = off2.top + height / 2;
	    	// if (y1 > y2) y1 = off1.top;
	    	// // distance
	    	// var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
	    	// // center
	    	// var cx = ((x1 + x2) / 2) - (length / 2);
	    	// var cy = ((y1 + y2) / 2) - (thickness / 2);
	    	// // angle
	    	// var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
	    	// // make hr
	    	// //var htmlLine = "<div style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";
	    	// var transitioning = false;
			//
	    	// d3.select("body").append("div")//.insert("div", ".tooltip")
	    	// 	.attr("class", "connector")
	    	// 	.style("padding", 0)
	    	// 	.style("margin", 0)
	    	// 	.style("height", thickness + "px")
	    	// 	//.style("background-color", "lavender")
	    	// 	.style("line-height", thickness + "px")
	    	// 	.style("position", "absolute")
	    	// 	.style("left", cx + "px")
	    	// 	.style("top", cy + "px")
	    	// 	.style("width", length + "px")
	    	// 	.style("-moz-transform", "rotate(" + angle + "deg)")
	    	// 	.style("-webkit-transform", "rotate(" + angle + "deg)")
	    	// 	.style("-o-transform", "rotate(" + angle + "deg)")
	    	// 	.style("-ms-transform", "rotate(" + angle + "deg)")
	    	// 	.style("transform", "rotate(" + angle + "deg)")
	    	// 	.style("border-radius", "10px")
	    	// 	.on("mouseover", function () {
	    	// 		d3.select(this).style("background-color", targetHighlight)
	    	// 			.style("background-opacity", .5)
	    	// 		d3.select(this).style("cursor", function () {
		    // 			if (y1 > y2) {
		    // 				return "n-resize";
		    // 			} else {
		    // 				return "s-resize";
		    // 			}
		    // 		});
	    	// 	})
	    	// 	.on("mouseout", function () {
	    	// 		var target = d3.event.toElement || d3.event.relatedTarget;
	    	// 		d3.select(this).style("background-color", null);
			//
	    	// 		if (target == null) {
	    	// 			d3.selectAll(".y-" + datum)
	    	// 				.style("background-color", null);
	    	// 			tooltip.style("opacity", "0");
			// 				tooltipSentence.style("opacity", "0");
		    // 			return d3.selectAll(".connector").remove();
	    	// 		} else if (d3.select(target).classed("connector") == false && target.tagName !== "HR" && target.tagName !== "SVG" && transitioning == false){
	    	// 			d3.selectAll(".y-" + datum).style("background-color", null);
	    	// 			tooltip.style("opacity", "0");
			// 				tooltipSentence.style("opacity", "0");
		    // 			return d3.selectAll(".connector").remove();
		    // 		}
	    	// 	})
    		//     .on("click", function () {
    		//     	transitioning = true;
    		//     	$('html, body').animate({
    		// 			scrollTop: $(el2).offset().top - 50,
    		// 		}, transitionDuration, function () {
    		// 			d3.selectAll(".y-" + datum).transition()
    		// 				.duration(transitionDuration / 2)
    		// 				.style("background-color", "rgba(255,255,255,0)")
    		// 				.each("end", function () {
    		// 					d3.select(this).style("background-color", null);
    		// 				})
	    	// 			tooltip.style("opacity", "0");
			// 				tooltipSentence.style("opacity", "0");
		    // 			return d3.selectAll(".connector").remove();
    		// 		});
    		//     	return false;
    		//     })
	    	// .append("hr")
	    	// 	.style("margin-top", (thickness / 2 - 1) + "px");
		    //

	if (allowedInteractions.includes('dblclickOnWSVToGetBack')) {
		clonedSparklificated.dblclick(function(event) {

			// so dblclick in $(html) is not triggered
			event.stopPropagation();

			var doubleClickedElementWhiteBackground = d3.select($(this)[0]).datum().backgroundElement[0];

			var animationSequence = [];

			// giveUpLayout($(this)[0]);

			// remove the spacer, only for grid-no-overlap
			if ($('#spacer').length > 0) {
				$('#spacer').remove();

				// change the entityBbox as the spacer was removed
				$.each(WSV_cloned, function(index, d) {

					d.entityBbox = get_BBox_entity(d.anEntity.parent())

				});
			}

			draw_connection_line('connectorLine', $(this), null);

			var toBeColoredBefore;
			var toBeColoredAfter;
			// select the sentence parts to be colored
			if (theEntity.parent().prev().text().slice(-1) === '.') {
				toBeColoredAfter = $(theEntity).parent().next().next();
			} else {
				toBeColoredBefore = $(theEntity).parent().prev();
				toBeColoredAfter = $(theEntity).parent().next().next();
			}

			// calculating offset depending on the distance between bottom of wsv and bottom of document
			var topWSVToWindowTop = window.innerHeight/2.0;
			var topWSVToBottomDoc = document.body.scrollHeight - $(theEntity).parent()[0].getBoundingClientRect().top + window.pageYOffset;
			if ((topWSVToBottomDoc - heightWordScaleVis) < window.innerHeight/2.0) {
				topWSVToWindowTop = ($(theEntity).parent()[0].getBoundingClientRect().top + window.pageYOffset) - document.body.scrollHeight + window.innerHeight;
			}
			topWSVToWindowTop = -topWSVToWindowTop;

			// give up the layout, but exclude the dbclicked clones wsv
			goingBackAnimationRunning = true;
			giveUpLayout($(this)[0]);

			var thePracticeIframe = window.parent.document.getElementById('practice_article');
			if (thePracticeIframe !== null) {

				var hack = theEntity[0].getBoundingClientRect().top - currentEntity.getBoundingClientRect().top;

				animationSequence.push({e: $(theEntity),
																p: "scroll",
																o: {duration: 3500,
																		offset: hack,
																		container: window.parent.document.getElementsByTagName('body')[0],
																		easing: [ .45, 0, .45, 1 ]
																	}
															})
			} else {

				animationSequence.push({e: $(theEntity),
																p: "scroll",
																o: {duration: 3500,
																		offset: topWSVToWindowTop,
																		easing: [ .45, 0, .45, 1 ]}
															})
			}

			// disappearing white background
			animationSequence.push({e: $(doubleClickedElementWhiteBackground),
															p: {opacity: 0},
															o: {
																	display: "none",
																	sequenceQueue: false,
																	duration: 1500,
																}
														});

			animationSequence.push({e: $(theEntity).parent().next(),
															p: {left: $(theEntity).parent().offset().left, top: $(theEntity).parent().offset().top},
															o: {
																// queue: false,
																	// offset: topWSVToWindowTop,
																	duration: 3500,
																	sequenceQueue: false,
																	easing: [ .45, 0, .45, 1 ],
																	complete: function() {
																		console.log('animation over');

																		removeConnectorLine();

																		$(theEntity).parent().next().children().remove();

																		// color the sentence parts
																		if (typeof toBeColoredBefore !== 'undefined') {
																			toBeColoredBefore.css('background-color','#FFE0EB');
																			toBeColoredBefore.css('color','#000000');
																		}

																		if (typeof toBeColoredAfter !== 'undefined') {
																			toBeColoredAfter.css('background-color','#FFE0EB');
																			toBeColoredAfter.css('color','#000000');
																		}

																		// remove white background
																		doubleClickedElementWhiteBackground.remove();

																		cleanupAfterLayout();

																		goingBackAnimationRunning = false;

																		// logStudyEvent('navigation', {'interaction_type': 'back to original entity', 'entity': theEntity[0].textContent.trim()});
																	}
															}
														});

			$.Velocity.RunSequence(animationSequence);

			if (typeof toBeColoredBefore !== 'undefined') {
				toBeColoredBefore.click(function() {
					toBeColoredBefore.css('background-color','#FFFFFF');
					if (typeof toBeColoredAfter !== 'undefined') {
						toBeColoredAfter.css('background-color','#FFFFFF');
					}
				});
			}

			if (typeof toBeColoredAfter !== 'undefined') {
				toBeColoredAfter.click(function() {
					toBeColoredAfter.css('background-color','#FFFFFF');
					if (typeof toBeColoredBefore !== 'undefined') {
						toBeColoredBefore.css('background-color','#FFFFFF');
					}
				});
			}

			layoutFlag = false;

		});
	}

	return clonedSparklificated;
}


/**
 * swapping two elements in an array, or two arrays
 * @param  {[type]} array         [description]
 * @param  {[type]} originalIndex [description]
 * @param  {[type]} newIndex      [description]
 * @return {[type]}               [description]
 */
function swapArrayElement(originalArray, newArray, originalIndex, newIndex, aNameOldLocationDragged, aNameOldLocationTarget) {
	var tmp = originalArray[originalIndex];
	originalArray[originalIndex] = newArray[newIndex];
	newArray[newIndex] = tmp;

	// set the correct attribute aboveOrBelow
	originalArray[originalIndex].aboveOrBelow = aNameOldLocationDragged;
	newArray[newIndex].aboveOrBelow = aNameOldLocationTarget;
}



// SORTING

function randomSort() {
	dl.permute(WSV_cloned);
}


function lastValueSort() {
	WSV_cloned.sort(dl.comparator(['-last_data_value']));
}


function maxSort() {
	WSV_cloned.sort(dl.comparator(['-max_data_value']));
}


function minSort() {
	WSV_cloned.sort(dl.comparator(['-min_data_value']));
}


function entityNameSort() {
	WSV_cloned.sort(dl.comparator(['+entityName']));
}


function docPositionSort() {
	WSV_cloned.sort(dl.comparator(["+docPosition['top']", "+docPosition['left']"]));
}


function docPositionWithContextSort() {
	WSV_cloned.sort(dl.comparator(['+aboveOrBelow', "+docPosition['top']", "+docPosition['left']"]));
}


function withContextSort() {
	WSV_cloned.sort(dl.comparator(['+aboveOrBelow']));
}


// DRAGGING

// var swapDrag = d3.behavior.drag()
// 	.origin(function(d) { console.log('drag for swap ' + d); return d })
// 	.on('dragstart', dragstart)
// 	.on('drag', dragmove)
// 	.on('dragend', dragend);



function dragstart(d) {

	console.log('started to drag');

	 d3.event.sourceEvent.stopPropagation();

//TODO add border to show which wsv is being selected and then moved; use colored border or subtle backgrounds

	var bboxWSV = get_BBox_wsv_NEW($(this)[0], positionType);
	d.x = bboxWSV.left;
	d.y = bboxWSV.top;

	d3.select(this).classed('beingDragged', true);
	d3.select($(this).children('.clonedWSV.entity')[0]).classed('beingDragged', true);

	d3.select(this).style('cursor', '-moz-grab');
}


function dragmove(d) {

	//TODO when draggin changing the mouse cursor

	// d3.select(this).style('left', event.x)
	// 				.style('top', $(window).scrollTop() + event.y)
	// 				.style('cursor', '-moz-grabbing');

	d3.select(this).style('left', d3.event.x)
					.style('top', d3.event.y);
					// .style('cursor', '-moz-grabbing');


	d.x = d3.event.x;
	d.y = d3.event.y;
}


function dragend(d) {

	console.log('dragging stopped');

	if (event.shiftKey) {
		console.log('shift is involved');

		// TODO add the comparison diff feature here

	} else {

		// dragging a wsv to another one leads to swapping and not diffing
		var draggedWSV = this;

		var currentDraggedWSVPosition = get_BBox_wsv_NEW($(draggedWSV), positionType);
		var centroid_x = currentDraggedWSVPosition.left + (currentDraggedWSVPosition.width/2.0);
		var centroid_y = currentDraggedWSVPosition.top  + (currentDraggedWSVPosition.height/2.0);


		// drawCircle(centroid_x, centroid_y, 3, 'blue');

		// top row info
		// var upperBorder_row0_y = layoutInfo.topLeftCorner_top;
		// var lowerBorder_row0_y = layoutInfo.topLeftCorner_top + layoutInfo.cell_dimensions.height + layoutInfo.spaceBetweenGridCells;
		//
		// var bottomCorner_y = WSV_cloned[WSV_cloned.length-1].entityBoxClonedObject.bottom;
		// // var bottomCorner_y = clonedWSV.below[clonedWSV.below.length-1].entityBoxClonedObject.bottom;
		// // bottom row info
		// var upperBorder_rowLast_y = bottomCorner_y - (layoutInfo.cell_dimensions.height + layoutInfo.spaceBetweenGridCells);
		// var lowerBorder_rowLast_y = bottomCorner_y ;

	// TODO has everything in the clonedWSV been updated to the latest value after being moved


		var wasThereATarget = false;

		$('.sparklificated.clonedWSV:not(.beingDragged)').each(function() {

			var targetWSV = this;
			// var targetWSVInfo = d3.select(targetWSV).datum();
			// var targetArray = getDraggedOrTargetArray(targetWSV);
			// var targetArray = WSV_cloned;

	// TODO easier to just take the wsvBoxClonedObject but currently does not work, if the bug is removed then could use this
			// var a_measurement = targetArray[targetWSVInfo.originalIndex].wsvBoxClonedObject
			var a_measurement = get_BBox_wsv_NEW($(targetWSV), positionType);
			var topLeft_x = a_measurement.left;
			var topLeft_y = a_measurement.top;
			var bottomRight_x = a_measurement.left + a_measurement.width;
			var bottomRight_y = a_measurement.top + a_measurement.height;
			// var targetCentroid_x = a_measurement.left + (a_measurement.width/2.0);
			// var targetCentroid_y = a_measurement.top + (a_measurement.height/2.0);

			// drawCircle(topLeft_x, topLeft_y, 3, 'green');
			// drawCircle(bottomRight_x, bottomRight_x, 3, 'green')


			if (centroid_x > topLeft_x && centroid_x < bottomRight_x && centroid_y > topLeft_y && centroid_y < bottomRight_y) {

				dragging(draggedWSV, targetWSV);

				wasThereATarget = true;
			}
		});

		if (!wasThereATarget) {
			dragging(draggedWSV, draggedWSV);
		}


		d3.select(draggedWSV).classed('beingDragged', false);
		d3.select($(draggedWSV).children('.clonedWSV.entity')[0]).classed('beingDragged', false);

		d3.select(this).style('cursor', 'auto');
	}
}



// var restrictedDrag = d3.behavior.drag()
// 	.origin(function(d) {
// 		if ($(this).attr('id') !== 'restrictedDragBand') {
// 			var current = d3.select(this);
// 			var result = {x: parseFloat(current.style('left')), y: parseFloat(current.style('top'))};
// 			d.startPosition = result.x;
// 			return result;
// 		} else {
// 			var current = d3.select(this);
// 			var result = {x: parseFloat(current.style('left')), y: parseFloat(current.style('top'))};
// 			// d.startPosition = result.x;
// 			return result;
// 		}
// 	})
//
// 	.on('dragstart', restrictedDragStart)
// 	.on('drag', restrictedDragMove)
// 	.on('dragend', restrictedDragEnd);


function restrictedDragStart(d) {

	console.log('started to restrictedDrag');

	// var startOffsetRowlayout = WSV_cloned[0].wsvBoxClonedObject.left - WSV_cloned[0].offset_whiteLayer;
	// var bandLength = WSV_cloned[WSV_cloned.length - 1].wsvBoxClonedObject.right - startOffsetRowlayout;
	//
	// var snapPositions = [];
	// $('.sparklificated.clonedWSV:not(.hide)').each(function() {
	// 	var offset = d3.select(this).datum().offset_whiteLayer;
	// 	snapPositions.push(parseFloat(d3.select(this).datum().x) - offset);
	// });
	//
	// layoutInfo.bandLength = bandLength;
	// layoutInfo.startOffsetRowlayout = startOffsetRowlayout;
	// layoutInfo.snapPositions = snapPositions;

	set_up_dynamic_row_layout();


	if ($(this).attr('id') !== 'restrictedDragBand') {

		console.log('restricted drag not on drag band');

		d3.select(this).classed('beingDragged', true);
		d3.select($(this).children('.clonedWSV.entity')[0]).classed('beingDragged', true);

		// d3.select(this).style('cursor', '-moz-grab');
	}
}


function restrictedDragMove(d) {

	var diff;
	if ($(this).attr('id') !== 'restrictedDragBand') {

		console.log('restricted drag not on drag band');

		// var originalLeft = d3.select(this).datum().x;

		var draggedWSV = this;

		d.x = d3.event.x
		d3.select(draggedWSV).style('left', d.x);

		// d.y = d3.event.y;

		// diff = originalLeft - newPosition_x;
		diff = d3.event.dx;


		// console.log(diff + ' is it the same ' + d3.event.dx)
		//
		// var draggedElementIndex = d3.select(draggedWSV).datum().originalIndex;
		// // WSV_cloned[draggedElementIndex].rowLayoutPositioning.left = newPosition_x;
		//
		// WSV_cloned[draggedElementIndex].entityBoxClonedObject = get_BBox_entity($(draggedWSV));
		//
		// var whiteDraggedBackgroundElement = WSV_cloned[draggedElementIndex].backgroundElement[0];
		// d3.select(whiteDraggedBackgroundElement).style('left', (d.x - d.offset_whiteLayer));

		// var orginalRight = WSV_cloned[draggedElementIndex].rowLayoutPositioning.right;
		// WSV_cloned[draggedElementIndex].rowLayoutPositioning.right = orginalRight - diff;
		//
	} else {

		// var originalLeft = d3.select(this)

		diff = d3.event.dx;
	}

	move_row_wsvs(diff);

	// $.each(WSV_cloned, function(index, value) {
	// 	var otherWSV = this.theClonedWSV[0];
	// 	var d3_otherWSV_data = d3.select(otherWSV).datum();
	//
	// 	// if (!d3.select(otherWSV).classed('beingDragged')) {
	//
	// 		// var clonedWSV_left = this.rowLayoutPositioning.left;
	// 		// var clonedWSV_right = this.rowLayoutPositioning.right;
	//
	// 		var clonedWSV_left = d3.select(otherWSV).datum().x;
	//
	// 		var newClonedWSV_left = (((clonedWSV_left + diff) - layoutInfo.startOffsetRowlayout) % layoutInfo.bandLength) + layoutInfo.startOffsetRowlayout;
	// 		// var newClonedWSV_right = (((clonedWSV_right - diff) - layoutInfo.startOffsetRowlayout) % layoutInfo.bandLength) + layoutInfo.startOffsetRowlayout;
	//
	// 		// this.rowLayoutPositioning.left = newClonedWSV_left;
	// 		// this.rowLayoutPositioning.right = newClonedWSV_right;
	//
	// 		d3.select(otherWSV).datum().x = newClonedWSV_left;
	//
	// 		// set the position of the cloned element
	// 		d3.select(otherWSV).style('left', newClonedWSV_left);
	//
	//
	// 		this.entityBoxClonedObject = get_BBox_entity($(otherWSV));
	// 		var bboxClonedWSV = get_BBox_wsv_NEW($(otherWSV), positionType);
	//
	//
	// 		var whiteOtherBackgroundElement = this.backgroundElement[0];
	// 		d3.select(whiteOtherBackgroundElement).style('left', (newClonedWSV_left - d3_otherWSV_data.offset_whiteLayer));
	//
	// 		if (!d3.select(otherWSV).classed('hide') && (bboxClonedWSV.right < layoutInfo.viewportLeft)) {
	// 			// visible and just crossed left border
	//
	// 			d3.select(otherWSV).classed('hide', true);
	// 			d3.select(otherWSV).selectAll('.clonedWSV').classed('hide', true);
	// 			d3.select(whiteOtherBackgroundElement).classed('hide', true);
	//
	// 			// console.log('visible and crossed left border ' + this.anEntity[0].innerText);
	//
	// 		} else if (!d3.select(otherWSV).classed('hide') && (newClonedWSV_left > layoutInfo.viewportRight)) {
	// 			// visible and just crossed right border
	//
	// 			d3.select(otherWSV).classed('hide', true);
	// 			d3.select(otherWSV).selectAll('.clonedWSV').classed('hide', true);
	// 			d3.select(whiteOtherBackgroundElement).classed('hide', true);
	//
	// 			// console.log('visible and crossed right border ' + this.anEntity[0].innerText);
	//
	// 		} else if (d3.select(otherWSV).classed('hide') && ((newClonedWSV_left < layoutInfo.viewportRight) && (newClonedWSV_left > layoutInfo.viewportLeft)) || ((bboxClonedWSV.right < layoutInfo.viewportRight) && (bboxClonedWSV.right > layoutInfo.viewportLeft))) {
	// 			// was hidden and just crossed the left or right border
	//
	// 			d3.select(otherWSV).classed('hide', false);
	// 			d3.select(otherWSV).selectAll('.clonedWSV').classed('hide', false);
	// 			d3.select(whiteOtherBackgroundElement).classed('hide', false);
	//
	// 			// console.log('hidden crossed left or right border ' + this.anEntity[0].innerText)
	// 		}
	// 	// }
	//
	// 	// update the entity bbox measurements for the trail functionality
	// 	this.entityBoxClonedObject = get_BBox_entity($(otherWSV));
	//
	// });

}


function restrictedDragEnd(d) {

	console.log('restrictedDragging stopped');

	var draggedWSV = this;


// don't forget to update the d values of all

	// var distMoved = d.x - d.startPosition;
	// var distToMove = layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)// + d.middleBoundOffset;
	// var distStillToMove = distToMove - (distMoved - (parseInt(distMoved / distToMove) * distToMove));

	// get the element that is close to the middle as a representer
	var notHiddenWSV = $('.sparklificated.clonedWSV:not(.hide)');
	var representer = notHiddenWSV[Math.floor(notHiddenWSV.length / 2.0)];


	var distStillToMove = 10000000;
	$.each(layoutInfo.snapPositions, function(index, value) {

		var difference = (d3.select(representer).datum().x - d3.select(representer).datum().offset_whiteLayer) - value;
		if (Math.abs(difference) < distStillToMove) {
			distStillToMove = difference;
		}

	});

	// console.log(distStillToMove);

	move_row_wsvs(-distStillToMove)

	// $.each(WSV_cloned, function(index, value) {
	// 	var aWSV = this.theClonedWSV[0];
	// 	var d3_aWSV_data = d3.select(aWSV).datum();
	//
	//
	// 	// var clonedWSV_left = this.rowLayoutPositioning.left;
	// 	// var clonedWSV_right = this.rowLayoutPositioning.right;
	//
	// 	var clonedWSV_left = d3.select(aWSV).datum().x
	//
	//
	// 	var whiteLayerOffset = d3.select(this.theClonedWSV[0]).datum().offset_whiteLayer;
	//
	// 	var newClonedWSV_left = (((clonedWSV_left - distStillToMove) - layoutInfo.startOffsetRowlayout) % layoutInfo.bandLength) + layoutInfo.startOffsetRowlayout;
	// 	// var newClonedWSV_right = (((clonedWSV_right - distStillToMove) - layoutInfo.startOffsetRowlayout) % layoutInfo.bandLength) + layoutInfo.startOffsetRowlayout;
	//
	// 	// this.rowLayoutPositioning.left = newClonedWSV_left;
	// 	// this.rowLayoutPositioning.right = newClonedWSV_right;
	//
	// 	d3.select(aWSV).datum().x = newClonedWSV_left;
	//
	// 	// set the position of the cloned element
	// 	d3.select(aWSV).style('left', newClonedWSV_left);
	//
	//
	// 	this.entityBoxClonedObject = get_BBox_entity($(aWSV));
	//
	// 	var bboxClonedWSV = get_BBox_wsv_NEW($(aWSV), positionType);
	//
	// 	var whiteOtherBackgroundElement = this.backgroundElement[0];
	// 	d3.select(whiteOtherBackgroundElement).style('left', (newClonedWSV_left - d3_aWSV_data.offset_whiteLayer));
	//
	// 	if (!d3.select(aWSV).classed('hide') && (bboxClonedWSV.right < layoutInfo.viewportLeft)) {
	// 		// visible and just crossed left border
	//
	// 		d3.select(aWSV).classed('hide', true);
	// 		d3.select(aWSV).selectAll('.clonedWSV').classed('hide', true);
	// 		d3.select(whiteOtherBackgroundElement).classed('hide', true);
	//
	//
	// 		// console.log('visible and crossed left border ' + this.anEntity[0].innerText);
	//
	// 	} else if (!d3.select(aWSV).classed('hide') && (newClonedWSV_left > layoutInfo.viewportRight)) {
	// 		// visible and just crossed right border
	//
	// 		d3.select(aWSV).classed('hide', true);
	// 		d3.select(aWSV).selectAll('.clonedWSV').classed('hide', true);
	// 		d3.select(whiteOtherBackgroundElement).classed('hide', true);
	//
	// 		// console.log('visible and crossed right border ' + this.anEntity[0].innerText);
	//
	//
	// 	} else if (d3.select(aWSV).classed('hide') && ((newClonedWSV_left < layoutInfo.viewportRight) && (newClonedWSV_left > layoutInfo.viewportLeft)) || ((bboxClonedWSV.right < layoutInfo.viewportRight) && (bboxClonedWSV.right > layoutInfo.viewportLeft))) {
	//
	//
	// 		d3.select(aWSV).classed('hide', false);
	// 		d3.select(aWSV).selectAll('.clonedWSV').classed('hide', false);
	// 		d3.select(whiteOtherBackgroundElement).classed('hide', false);
	//
	// 		// console.log('hidden crossed left or right border ' + this.anEntity[0].innerText)
	// 	}
	// });

	d3.select(draggedWSV).classed('beingDragged', false);
	d3.select($(draggedWSV).children('.clonedWSV.entity')[0]).classed('beingDragged', false);
}


function set_up_dynamic_row_layout() {

	if (layoutInfo.bandLength === 0 && layoutInfo.startOffsetRowlayout === 0 && layoutInfo.snapPositions.length === 0) {

		var startOffsetRowlayout = WSV_cloned[0].wsvBoxClonedObject.left - WSV_cloned[0].offset_whiteLayer;
		var bandLength = WSV_cloned[WSV_cloned.length - 1].wsvBoxClonedObject.right - startOffsetRowlayout;

		var snapPositions = [];
		$('.sparklificated.clonedWSV:not(.hide)').each(function() {
			var offset = d3.select(this).datum().offset_whiteLayer;
			snapPositions.push(parseFloat(d3.select(this).datum().x) - offset);
		});

		layoutInfo.bandLength = bandLength;
		layoutInfo.startOffsetRowlayout = startOffsetRowlayout;
		layoutInfo.snapPositions = snapPositions;
	}
}


function move_row_wsvs(distance) {

	var initialLeftPos;
	var tmpLeftPosition;

	$.each(WSV_cloned, function(index, value) {
		var currentWSV = this.theClonedWSV[0];
		var d3_otherWSV_data = d3.select(currentWSV).datum();
		var clonedWSV_left = d3.select(currentWSV).datum().x;

		if (distance > 0) {
			// get the next element in wsv_cloned its left position
			if (index == 0) {
				initialLeftPos = clonedWSV_left - d3_otherWSV_data.offset_whiteLayer;
			}

			var nextIndex = index + 1;
			var nextWSVsLeftPosition;

			if (nextIndex == WSV_cloned.length) {
				nextIndex = 0
				nextWSVsLeftPosition = initialLeftPos + d3_otherWSV_data.offset_whiteLayer;
			} else {
				nextWSVsLeftPosition = d3.select(WSV_cloned[nextIndex].theClonedWSV[0]).datum().x - d3.select(WSV_cloned[nextIndex].theClonedWSV[0]).datum().offset_whiteLayer;
				nextWSVsLeftPosition = nextWSVsLeftPosition + d3_otherWSV_data.offset_whiteLayer;
			}
		} else {
			// left triangle was hit
			var previousIndex = index - 1
			if (previousIndex < 0) {
				previousIndex = WSV_cloned.length - 1;

				nextWSVsLeftPosition = d3.select(WSV_cloned[previousIndex].theClonedWSV[0]).datum().x - d3.select(WSV_cloned[previousIndex].theClonedWSV[0]).datum().offset_whiteLayer;
				nextWSVsLeftPosition = nextWSVsLeftPosition + d3_otherWSV_data.offset_whiteLayer;
			} else {
				nextWSVsLeftPosition = tmpLeftPosition
				nextWSVsLeftPosition = nextWSVsLeftPosition + d3_otherWSV_data.offset_whiteLayer;
			}

			tmpLeftPosition = clonedWSV_left - d3_otherWSV_data.offset_whiteLayer;
		}


		// if (!d3.select(currentWSV).classed('beingDragged')) {

			// var clonedWSV_left = this.rowLayoutPositioning.left;
			// var clonedWSV_right = this.rowLayoutPositioning.right;

		// var clonedWSV_left = d3.select(currentWSV).datum().x;

		// var newClonedWSV_left = (((clonedWSV_left + distance) - layoutInfo.startOffsetRowlayout) % layoutInfo.bandLength) + layoutInfo.startOffsetRowlayout;
		newClonedWSV_left = nextWSVsLeftPosition;

		// var newClonedWSV_left = (clonedWSV_left + distance) - layoutInfo.startOffsetRowlayout;
		// var newClonedWSV_right = (((clonedWSV_right - diff) - layoutInfo.startOffsetRowlayout) % layoutInfo.bandLength) + layoutInfo.startOffsetRowlayout;

		// if (newClonedWSV_left > 0) {
		// 	newClonedWSV_left = (newClonedWSV_left % layoutInfo.bandLength) + layoutInfo.startOffsetRowlayout;
		// } else {
		// 	newClonedWSV_left = layoutInfo.bandLength - newClonedWSV_left - layoutInfo.startOffsetRowlayout;
		// }

		// this.rowLayoutPositioning.left = newClonedWSV_left;
		// this.rowLayoutPositioning.right = newClonedWSV_right;



		d3.select(currentWSV).datum().x = newClonedWSV_left;

		// set the position of the cloned element
		d3.select(currentWSV).style('left', newClonedWSV_left);

		// unhide wsv to get the bboxes
		d3.select(currentWSV).classed('hide', false);
		d3.select(currentWSV.children[0]).classed('hide', false);
		d3.select(currentWSV.children[1]).classed('hide', false);

		this.entityBoxClonedObject = get_BBox_entity($(currentWSV));
		var bboxClonedWSV = get_BBox_wsv_NEW($(currentWSV), positionType);


		var whiteOtherBackgroundElement = this.backgroundElement[0];
		d3.select(whiteOtherBackgroundElement).classed('hide', false);
		d3.select(whiteOtherBackgroundElement).style('left', (newClonedWSV_left - d3_otherWSV_data.offset_whiteLayer));

		// var proxyWSVRightBorderPos = newClonedWSV_left + layoutInfo.cell_dimensions['width'];

		if (!d3.select(currentWSV).classed('hide') && ((bboxClonedWSV.left < layoutInfo.viewportLeft) || (bboxClonedWSV.right > layoutInfo.viewportRight))) {
			// is visible and just crossed left border

			d3.select(currentWSV).classed('hide', true);
			d3.select(currentWSV).selectAll('.clonedWSV').classed('hide', true);
			d3.select(whiteOtherBackgroundElement).classed('hide', true);

	} else if (d3.select(currentWSV).classed('hide') && (((newClonedWSV_left < layoutInfo.viewportRight) && (newClonedWSV_left > layoutInfo.viewportLeft)) || ((bboxClonedWSV.right < layoutInfo.viewportRight) && (bboxClonedWSV.right > layoutInfo.viewportLeft)))) {
			// is hidden and just crossed the left or right border

			d3.select(currentWSV).classed('hide', false);
			d3.select(currentWSV).selectAll('.clonedWSV').classed('hide', false);
			d3.select(whiteOtherBackgroundElement).classed('hide', false);
		}

		// update the entity bbox measurements for the trail functionality
		this.entityBoxClonedObject = get_BBox_entity($(currentWSV));

	});
}



// var dragInBetween = d3.behavior.drag()
// 	.origin(function(d) { console.log('drag for inbetween ' + d); return d })
// 	.on('dragstart', inBetweenDragstart)
// 	.on('drag', inBetweenDragmove)
// 	.on('dragend', inBetweenDragend);



function inBetweenDragstart(d) {

	console.log('started to do an inBeetween drag');

	// var bboxWSV = get_BBox_wsv_NEW($(this)[0], positionType);
	// d.x = bboxWSV.left;
	// d.y = bboxWSV.top;

	d3.select(this).classed('beingDragged', true);
	d3.select($(this).children('.clonedWSV.entity')[0]).classed('beingDragged', true);
}


function inBetweenDragmove(d) {

	console.log('dragging for inBetween is moving');

	var draggedWSV = this;

	// make the dragged wsv fully visible when not hovering over other wsvs
	$(draggedWSV).css('opacity', 1);
	$(draggedWSV).css('z-index', 10);


	// $(draggedWSV).css('background-color', '#ffffff');
	// // $(draggedWSV).children('.entity').css('background-color', '#ffffff');
	// $(draggedWSV).children('.sparkline').css('background-color', '#ffffff');

	d3.select(this).style('left', d3.event.x)
					.style('top', d3.event.y);

	d.x = d3.event.x;
	d.y = d3.event.y;

	var mousePointer = d3.mouse(d3.select('html')[0][0]);


	// debugging
	var test1 = $(this).css('z-index');
	var test2 = $(this).children('.entity').css('z-index');
	var test3 = $(this).children('.sparkline').css('z-index');
	// console.log('wsv: ' + test1 + ' entity: ' + test2 + ' sparkline: ' + test3);

	// drawCircle(mousePointer[0], mousePointer[1], 2, 'green');
	// drawCircle(d3.event.x, d3.event.y, 2, 'green');

	$('.sparklificated.clonedWSV:not(.beingDragged)').each(function() {

		var targetWSV = this;
		var targetWSVInfo = d3.select(targetWSV).datum();
		var a_measurement = WSV_cloned[targetWSVInfo.originalIndex].wsvBoxClonedObject;

		// console.log('measurements: ' + 'index ' + targetWSVInfo.originalIndex + ' ' + a_measurement.left + ' ' + a_measurement.top + ' ' + a_measurement.right + ' ' + a_measurement.bottom);

		var upperCorner_top = a_measurement.top;
		var upperCorner_left = a_measurement.left;
		var lowerCorner_bottom = a_measurement.bottom;
		var lowerCorner_right =	a_measurement.right;

		// drawCircle(upperCorner_left, upperCorner_top, 3, 'green');
		// drawCircle(lowerCorner_right, lowerCorner_bottom, 3, 'blue');
		// drawLine(upperCorner_top, 'horizontal', 'red');
		// drawLine(lowerCorner_bottom, 'horizontal', 'blue');

		var height25percent = a_measurement.height * 0.35;
		var target_top = a_measurement.top;
		var target_bottom = a_measurement.bottom;


		if ((mousePointer[1] >= target_top) && (mousePointer[1] <= (target_top + height25percent)) && (mousePointer[0] >= a_measurement.left) && (mousePointer[0] <= a_measurement.right)) {

			$(draggedWSV).css('opacity', 0.2);

			$(targetWSV).removeClass('addAfter');
			$(targetWSV).removeClass('compare');
			$(targetWSV).addClass('addBefore');

			// var test1 = $(targetWSV).css('z-index');
			// var test2 = $(targetWSV).children('.entity').css('z-index');
			// var test3 = $(targetWSV).children('.sparkline').css('z-index');
			// console.log('wsv: ' + test1 + ' entity: ' + test2 + ' sparkline: ' + test3);

		} else if ((mousePointer[1] > (target_top + height25percent)) && (mousePointer[1] < (target_bottom - height25percent)) && (mousePointer[0] >= a_measurement.left) && (mousePointer[0] <= a_measurement.right)) {

			$(draggedWSV).css('opacity', 0.2);

			$(targetWSV).removeClass('addAfter');
			$(targetWSV).removeClass('addBefore');
			$(targetWSV).addClass('compare');

			// var test1 = $(targetWSV).css('z-index');
			// var test2 = $(targetWSV).children('.entity').css('z-index');
			// var test3 = $(targetWSV).children('.sparkline').css('z-index');
			// console.log('wsv: ' + test1 + ' entity: ' + test2 + ' sparkline: ' + test3);

		} else if ((mousePointer[1] <= target_bottom) && (mousePointer[1] >= (target_bottom - height25percent)) && (mousePointer[0] >= a_measurement.left) && (mousePointer[0] <= a_measurement.right)) {

			$(draggedWSV).css('opacity', 0.2);

			$(targetWSV).removeClass('compare');
			$(targetWSV).removeClass('addBefore');
			$(targetWSV).addClass('addAfter');

			// var test1 = $(targetWSV).css('z-index');
			// var test2 = $(targetWSV).children('.entity').css('z-index');
			// var test3 = $(targetWSV).children('.sparkline').css('z-index');
			// console.log('wsv: ' + test1 + ' entity: ' + test2 + ' sparkline: ' + test3);

		} else {

			$(targetWSV).removeClass('compare');
			$(targetWSV).removeClass('addBefore');
			$(targetWSV).removeClass('addAfter');
		}
	});
}


function inBetweenDragend(d) {

	console.log('inBetween dragging stopped');


	// dragging a wsv to another one depending on where it is dropped get pushed before or after it
	var draggedWSV = this;

	// when the dragging has ended put the opacity back to 1
	$(draggedWSV).css('opacity', 1);

	var draggedWSVInfo = d3.select(draggedWSV).datum();

	// the mouse pointer coordiantes are taken w.r.t. to the 'html' container, the root containter
	var mousePointer = d3.mouse(d3.select('html')[0][0]);
	// console.log(mousePointer);

	//drawCircle(mousePointer[0], mousePointer[1], 3, 'blue');

	var wasThereATarget = false;

	var targetIndexFound;
	var where;

	$('.sparklificated.clonedWSV:not(.beingDragged)').each(function() {

		var targetWSV = this;
		var targetWSVInfo = d3.select(targetWSV).datum();
		var a_measurement = WSV_cloned[targetWSVInfo.originalIndex].wsvBoxClonedObject;

		//console.log('measurements: ' + 'index ' + targetWSVInfo.originalIndex + ' ' + a_measurement.left + ' ' + a_measurement.top + ' ' + a_measurement.right + ' ' + a_measurement.bottom);

		var height25percent = a_measurement.height * 0.35;
		var target_top = a_measurement.top;
		var target_bottom = a_measurement.bottom;


		if ((mousePointer[1] >= target_top) && (mousePointer[1] <= (target_top + height25percent)) && (mousePointer[0] >= a_measurement.left) && (mousePointer[0] <= a_measurement.right)) {

			// drawCircle( a_measurement.left, a_measurement.top, 3, 'green');
			// drawCircle( a_measurement.right, a_measurement.bottom, 3, 'red');

			// drawLine(target_top + height25percent, 'horizontal', 'red')
			// drawLine(target_bottom - height25percent, 'horizontal', 'blue')

			console.log('before');

			targetIndexFound = targetWSVInfo.originalIndex;
			where = 'before';

			// movingElement(targetWSVInfo.originalIndex, draggedWSVInfo.originalIndex, 'before', WSV_cloned[draggedWSVInfo.originalIndex])

			wasThereATarget = true;

		} else if ((mousePointer[1] > (target_top + height25percent)) && (mousePointer[1] < (target_bottom - height25percent)) && (mousePointer[0] >= a_measurement.left) && (mousePointer[0] <= a_measurement.right)) {

			// drawLine(target_top + height25percent, 'horizontal', 'red')
			// drawLine(target_bottom - height25percent, 'horizontal', 'blue')

			console.log('do comparison');
			wasThereATarget = true;

		} else if ((mousePointer[1] <= target_bottom) && (mousePointer[1] >= (target_bottom - height25percent)) && (mousePointer[0] >= a_measurement.left) && (mousePointer[0] <= a_measurement.right)) {

			// drawLine(target_top + height25percent, 'horizontal', 'red')
			// drawLine(target_bottom - height25percent, 'horizontal', 'blue')

			console.log('after');

			targetIndexFound = targetWSVInfo.originalIndex;
			where = 'after';
			// movingElement(targetWSVInfo.originalIndex, draggedWSVInfo.originalIndex, 'after', WSV_cloned[draggedWSVInfo.originalIndex])

			wasThereATarget = true;
		}

		$(targetWSV).removeClass('compare');
		$(targetWSV).removeClass('addBefore');
		$(targetWSV).removeClass('addAfter');
	});


	if (wasThereATarget) {

		WSV_cloned[draggedWSVInfo.originalIndex].wsvBoxClonedObject = get_BBox_wsv_NEW(draggedWSV, positionType);

		movingElement(targetIndexFound, draggedWSVInfo.originalIndex, where, WSV_cloned[draggedWSVInfo.originalIndex])

	} else {
// this should be fixed, with not addding a border before doing calculation
//TODO there is a small offset in x added not sure why, only in this case
		dragging(draggedWSV, draggedWSV);

	}

	// put the old z-index back
	var oldZIndex = d3.select(draggedWSV).datum().zIndex;
	$(draggedWSV).css('z-index', oldZIndex);


	d3.select(draggedWSV).classed('beingDragged', false);
	d3.select($(draggedWSV).children('.clonedWSV.entity')[0]).classed('beingDragged', false);
}



function dragStartForDiff(d) {

	console.log('started to drag for diffing');

	d3.event.sourceEvent.stopPropagation();

	// dragged = event.target;
	dragged = d3.event.sourceEvent.currentTarget;
	// make it half transparent
	// event.target.style.opacity = '.5';
	 d3.event.sourceEvent.currentTarget.style.opacity = '.5';

	var movableClone = $(d3.select(this)[0]).clone();
	$(this).before(movableClone);

	$(movableClone).addClass('movableClone');

	// d3.select(this).classed('beingDragged', true);
	// d3.select($(this).children('.clonedWSV.entity')[0]).classed('beingDragged', true);

	// get the sparkline data
	// var data_array = d3.select(movableClone).selectAll('g.wsv').data()[0].values;
	// var data_string = $.map(data_array, function(value, index) {
	// 	return value;
	// }).join(',');

	var theData = d3.select(this).select('g.wsv').data()[0];
	d3.select(movableClone[0]).select('g.wsv').datum(theData);


	// d3.select(this).style('cursor', '-moz-grab');
}


function dragMoveForDiff(d) {

	console.log('dragging for diffing is moving');

	// get the movable clone with respect to the element that triggered the event
	var movableClone = $(this).prev()[0];

	// moving the dummy sparkline
	// d3.select(this).style('left', d3.event.x)
	// 				.style('top', d3.event.y);
	// 				// .style('cursor', '-moz-grabbing');

	d3.select(movableClone).style('left', d3.event.x)
					.style('top', d3.event.y);

	// d.x = d3.event.x;
	// d.y = d3.event.y;
}


function dragEndForDiff(d) {
	console.log('drag for diffing stopped');

	d3.event.sourceEvent.stopPropagation();

	var movableClone = $(this).prev()[0]

	var draggedWSV = this;

	// var currentDraggedWSVPosition = get_BBox_wsv_NEW($(draggedWSV).children('.entity.clonedWSV'), positionType);
	var currentDraggedWSVPosition = get_BBox_wsv_NEW($(movableClone).parent(), positionType);
	var dragged_upperLeftCorner = {x: currentDraggedWSVPosition.left, y: currentDraggedWSVPosition.top};
	var dragged_upperRightCorner = {x: currentDraggedWSVPosition.right, y: currentDraggedWSVPosition.top};
	var dragged_bottomLeftCorner = {x: currentDraggedWSVPosition.left, y: currentDraggedWSVPosition.bottom};
	var dragged_bottomRightCorner = {x: currentDraggedWSVPosition.right, y: currentDraggedWSVPosition.bottom};


	// event.target provides the element on where the dragged wsv is droped
	console.log(d3.event.sourceEvent.target);
	// console.log(event.target.parentElement);
	//
	// var theWSVgElement = event.target.parentElement;
	// var targetSparkline = event.target.parentElement.parentElement.parentElement.parentElement;
	// var targetSparkline2 = event.target.parentElement.parentElement.parentElement;
	var theWSVgElement;
	var targetSparkline;
	var theDataElement;


	if (d3.event.sourceEvent.target.tagName === 'svg') {
		console.log('the tagName is SVG');
		theWSVgElement = d3.event.sourceEvent.target.parentElement;
		targetSparkline = d3.event.sourceEvent.target;
		theDataElement = d3.select(targetSparkline).select('g.wsv');
	} else if (d3.event.sourceEvent.target.tagName === 'path') {
		console.log('the tagName is PATH');
		theWSVgElement = event.target;
		targetSparkline = event.target.parentElement.parentElement.parentElement;
		theDataElement = d3.select(theWSVgElement.parentElement);
	}




	if (d3.select(theWSVgElement).classed('sparkline')) {

		console.log('droptarget is a sparkline!!!!')

		// get the sparkline data
		var data_array = d3.select(movableClone).selectAll('g.wsv').data()[0].values;


		console.log(data_array);


		// var oldData = d3.select(theWSVgElement).data();
		var oldData = theDataElement.data();
		// oldData[0].name = 'first';


		var newDataArray = oldData.push({name: 'second', values: data_array});

		if (d3.select(targetSparkline).classed('barChart')) {

			barChart(d3.select(targetWSV).select('.sparkline'), (widthMarkBarChart * oldData.length * numberOfMarks), heightWordScaleVis, false, oldData);

		} else if (d3.select(targetSparkline).classed('lineChart')) {

			stockPriceSparkline($(targetSparkline), (widthMarkLineChart * numberOfMarks), heightWordScaleVis, false, 'not_cloned', oldData);
		}
	}


	movableClone.remove();



	// if (d3.select(targetEntity).classed('entity') && d3.select(targetEntity).classed('beingDragged')) {
	// 	// no dropping of data
	//
	// 	//return to initial position
	// } else {
	//
	// 	var currentTargetWSVPosition = get_BBox_wsv(targetEntity, positionType);
	// 	var target_upperLeftCorner = {x: currentTargetWSVPosition.left, y: currentTargetWSVPosition.top};
	// 	var target_upperRightCorner = {x: currentTargetWSVPosition.right, y: currentTargetWSVPosition.top};
	// 	var target_bottomLeftCorner = {x: currentTargetWSVPosition.left, y: currentTargetWSVPosition.bottom};
	// 	var target_bottomRightCorner = {x: currentTargetWSVPosition.right, y: currentTargetWSVPosition.bottom};
	//
	//
	// 	// get the sparkline data
	// 	var data_array = d3.select(draggedWSV).selectAll('g.wsv').data()[0].values;
	// 	// var data_string = $.map(data_array, function(value, index) {
	// 	// 	return value;
	// 	// }).join(',');
	// 	//
	// 	console.log(data_array);
	//
	//
	// 	var oldData = d3.select(targetWSV).selectAll('g.wsv').data();
	// 	oldData[0].name = 'first';
	//
	//
	// 	var newDataArray = oldData.push({name: 'second', values: data_array});
	//
	// 	if (d3.select(targetWSV).select('svg').classed('barChart')) {
	//
	// 		barChart(d3.select(targetWSV).select('.sparkline'), (widthMarkBarChart * oldData.length * numberOfMarks), sizeWordScaleVis, false, oldData);
	//
	// 	} else if (d3.select(targetWSV).select('svg').classed('lineChart')) {
	//
	// 		classicSparkline($(targetSparkline), (widthMarkLineChart * numberOfMarks), sizeWordScaleVis, false, oldData);
	// 	}
	// }


	// d3.select(draggedWSV).classed('beingDragged', false);
	// d3.select($(draggedWSV).children('.clonedWSV.entity')[0]).classed('beingDragged', false);
}



function movingElement(oldIndex, draggedOrigianlIndex, where, draggedElement) {

	var situation = WSV_cloned[oldIndex].aboveOrBelow;

	var newIndex = oldIndex;
	if (where === 'after') {

		newIndex = oldIndex + 1;

		if (oldIndex < draggedOrigianlIndex) {
			WSV_cloned.splice(draggedOrigianlIndex, 1);
			WSV_cloned.splice(newIndex, 0, draggedElement);
		} else {
			WSV_cloned.splice(newIndex, 0, draggedElement);
			WSV_cloned.splice(draggedOrigianlIndex, 1);
		}

	} else if (where === 'before') {

		WSV_cloned.splice(draggedOrigianlIndex, 1);
		WSV_cloned.splice(newIndex, 0, draggedElement);

	}


	console.log('where ' + where + 'draggedOrigianlIndex ' + draggedOrigianlIndex + ' oldIndex ' + oldIndex + ' newIndex ' + oldIndex);


//TODO update the moved wsv-cloned element

	draggedElement.aboveOrBelow = situation;


	// update the element in wsv_cloned
	changeLayout(layoutType, 'dragInBetween');

}



//TODO when moving the cursor during the bring and go animation it produces an error--> get rid of it!

function dragging(draggedElement, targetElement) { //, theLayoutType) {

	var targetWSVInfo = d3.select(targetElement).datum();
	var draggedWSVInfo = d3.select(draggedElement).datum();

	// new position of draggedElement
	var draggedWS_newTop = 0;
	var draggedWS_newLeft = 0;

	var bbox_wsv_targetElement = WSV_cloned[targetWSVInfo.originalIndex].wsvBoxClonedObject;
	// draggedWS_newTop = bbox_wsv_targetElement.top - layoutInfo.spaceBetweenGridCells;
	draggedWS_newTop = bbox_wsv_targetElement.top;
	draggedWS_newLeft = bbox_wsv_targetElement.left - targetWSVInfo.middleBoundOffset + draggedWSVInfo.middleBoundOffset;


	console.log('bbox_wsv_targetElement ' + bbox_wsv_targetElement.top);


	var targetWSV_newTop = 0;
	var targetWSV_newLeft = 0;

	var bbox_wsv_draggedElement = WSV_cloned[draggedWSVInfo.originalIndex].wsvBoxClonedObject;
	// targetWSV_newTop = bbox_wsv_draggedElement.top - layoutInfo.spaceBetweenGridCells;
	targetWSV_newTop = bbox_wsv_draggedElement.top;
	targetWSV_newLeft = bbox_wsv_draggedElement.left - draggedWSVInfo.middleBoundOffset + targetWSVInfo.middleBoundOffset;

	console.log('bbox_wsv_draggedElement ' + bbox_wsv_draggedElement.top);


	var nameOldLocationDragged = WSV_cloned[draggedWSVInfo.originalIndex].aboveOrBelow

	var nameOldLocationTarget = WSV_cloned[targetWSVInfo.originalIndex].aboveOrBelow;


	// array elements not yet swaped
	$(draggedElement).velocity({left: (draggedWS_newLeft), top: (draggedWS_newTop)}, {
		duration: 500,
		complete: function() {

			$(targetElement).velocity({left: (targetWSV_newLeft), top: (targetWSV_newTop)}, {
				duration: 1000,
				complete: function() {

					swapArrayElement(WSV_cloned, WSV_cloned, draggedWSVInfo.originalIndex, targetWSVInfo.originalIndex, nameOldLocationDragged, nameOldLocationTarget);

					var draggedIndex = draggedWSVInfo.originalIndex;
					var targetIndex = targetWSVInfo.originalIndex;
					var draggedArray = WSV_cloned;
					var targetArray = WSV_cloned;

					d3.select(targetElement).datum().originalIndex = draggedIndex;
					d3.select(draggedElement).datum().originalIndex = targetIndex;

					d3.select(targetElement).datum().originalArrayName = draggedArray;
					d3.select(draggedElement).datum().originalArrayName = targetArray;

					// get the array
					// var theTargetArray = getDraggedOrTargetArray(targetElement);
					// var theDraggedArray = getDraggedOrTargetArray(draggedElement);
					var theTargetArray = WSV_cloned;
					var theDraggedArray = WSV_cloned;


					// test stuff to be removed
					$(draggedElement).addClass('draggedElement')
					$(targetElement).addClass('targetElement')


					// get new entityBbox
					theTargetArray[d3.select(targetElement).datum().originalIndex].entityBoxClonedObject = get_BBox_entity($(targetElement));
					theDraggedArray[d3.select(draggedElement).datum().originalIndex].entityBoxClonedObject = get_BBox_entity($(draggedElement));

					theTargetArray[d3.select(targetElement).datum().originalIndex].wsvBoxClonedObject = get_BBox_wsv_NEW($(targetElement), positionType);
					theDraggedArray[d3.select(draggedElement).datum().originalIndex].wsvBoxClonedObject = get_BBox_wsv_NEW($(draggedElement), positionType);

					d3.select(targetElement).datum().x = theTargetArray[d3.select(targetElement).datum().originalIndex].wsvBoxClonedObject.left;
					d3.select(targetElement).datum().y = theTargetArray[d3.select(targetElement).datum().originalIndex].wsvBoxClonedObject.top;

					d3.select(draggedElement).datum().x = theDraggedArray[d3.select(draggedElement).datum().originalIndex].wsvBoxClonedObject.left;
					d3.select(draggedElement).datum().y = theDraggedArray[d3.select(draggedElement).datum().originalIndex].wsvBoxClonedObject.top;
				}
			});
		}
	});

}



// function draw_diffLine(sourceElement_position, draggedElement_position) {
//
// 	console.log('draw new diffline');
// 	// console.log('dragged element ' + draggedElement_position.left + ' and ' + draggedElement_position.top);
//
// 	var svgContainer;
//
// 	// added the svg to the root body and not the text div, will make calculation easier
// 	if (d3.select('body svg.diffLine').empty()) {
// 		svgContainer = d3.select('body').insert('svg', ':first-child')
// 							.attr('width', $('body').width())
// 							.attr('height', $('body').height())
// 							.attr('class', 'diffLine');
// 	} else {
//
// 		svgContainer = d3.select('body svg.diffLine');
// 	}
//
// 	svgContainer.style('position', 'absolute');
// 	// svg can be clicked through
// 	svgContainer.style('pointer-events', 'none');
// 	svgContainer.style('z-index', 10);
//
//
// 	var bboxText = $('#text').offset();
//
//
// 	var xOrigin = sourceElement_position.left //- bboxText.left;
// 	var yOrigin = sourceElement_position.top - bboxText.top;
//
//
// 	var xDraggedElement = draggedElement_position.left //- bboxText.left;
// 	var yDraggedElement = draggedElement_position.top - bboxText.top;
//
// 	var s = {};
// 	s.x = xOrigin;
// 	s.y = yOrigin;
// 	var t = {};
// 	t.x = xDraggedElement;
// 	t.y = yDraggedElement;
//
// 	var lineEndpoints = [s, t];
//
// 	// drawCircle(t.x, t.y, 3, 'red')
//
// 	var line = d3.svg.line()
// 		.x(function(d) { return d.x; })
// 		.y(function(d) { return d.y; });
//
//
// 	var aDiffLine = svgContainer.selectAll('.diffLine')
// 			.data([lineEndpoints]);
//
// 	// aDiffLine.attr('d', line);
//
// 	aDiffLine.enter().append('path')
// 			.attr('class', 'diffLine')
// 			.attr('d', line);
//
//
// 	aDiffLine.exit().remove();
//
// }
//
//
// function draw_connector_line(aWSV) {
//
// 	var svgContainer;
//
// 	// added the svg to the root body and not the text div, will make calculation easier
// 	if (d3.select('body svg.hoveringTrail').empty()) {
// 		svgContainer = d3.select('body').insert('svg', ':first-child')
// 							.attr('width', $('body').width())
// 							.attr('height', $('body').height())
// 							.attr('class', 'connectorLine');
// 	} else {
//
// 		svgContainer = d3.select('body svg.connectorLine');
// 	}
//
//
// 	svgContainer.style('position', 'absolute');
// 	// svg can be clicked through
// 	svgContainer.style('pointer-events', 'none');
// 	svgContainer.style('z-index', 10);
//
//
// 	var bboxText = $('#text').offset();
//
// 	$.each(WSV_cloned, function(index, d) {
// 		if (typeof d.theClonedWSV !== 'undefined' && aWSV[0] === d.theClonedWSV[0]) {
//
// 			var xOrigin = d.entityBbox.left + (d.entityBbox.width/2.0);// - bboxText.left;
// 			var yOrigin = d.entityBbox.top + (d.entityBbox.height/2.0) - bboxText.top;
//
// 			// drawCircle(xOrigin, yOrigin, 'blue');
//
// 			var xClone = d.entityBoxClonedObject.left + (d.entityBoxClonedObject.width/2.0);// - bboxText.left;
// 			var yClone = d.entityBoxClonedObject.top + (d.entityBoxClonedObject.height/2.0) - bboxText.top;
//
// 			// drawCircle(xClone, yClone, 'blue');
//
// 			// based on this http://stackoverflow.com/questions/15007877/how-to-use-the-d3-diagonal-function-to-draw-curved-lines
// 			var s = {};
// 			s.x = xOrigin;
// 			s.y = yOrigin;
// 			var t = {};
// 			t.x = xClone;
// 			t.y = yClone;
//
// 			var lineEndpoints = [s, t];
//
// 			var line = d3.svg.line()
// 				.x(function(d) { return d.x; })
// 				.y(function(d) { return d.y; });
//
//
// 			var aConnectorLine = svgContainer.selectAll('.theConnectorLine')
// 					// .data([lineEndpoints]);
// 					.data([lineEndpoints]);
//
// 			aConnectorLine.attr('d', line);
//
// 			aConnectorLine.enter().append('path')
// 					.attr('class', 'theConnectorLine')
// 					.attr('d', line);
//
//
// 			// aConnectorLine.exit().remove();
//
// 		}
// 	});
// }
//
//
// function draw_trails_whenHover(aWSV) {
//
// 	var svgContainer;
//
// 	// added the svg to the root body and not the text div, will make calculation easier
// 	if (d3.select('body svg.hoveringTrail').empty()) {
// 		svgContainer = d3.select('body').insert('svg', ':first-child')
// 							.attr('width', $('body').width())
// 							.attr('height', $('body').height())
// 							.attr('class', 'hoveringTrail');
// 	} else {
//
// 		svgContainer = d3.select('body svg.hoveringTrail');
// 	}
//
//
// 	svgContainer.style('position', 'absolute');
// 	// svg can be clicked through
// 	svgContainer.style('pointer-events', 'none');
// 	svgContainer.style('z-index', 410);
//
//
// 	var bboxText = $('#text').offset();
// 	var bboxBody = $('body').offset();
//
// 	$.each(WSV_cloned, function(index, d) {
// 		if (typeof d.theClonedWSV !== 'undefined' && aWSV[0] === d.theClonedWSV[0]) {
//
// 			var xOrigin = d.entityBbox.left + (d.entityBbox.width/2.0) - bboxBody.left; //- bboxText.left;
// 			var yOrigin = d.entityBbox.top + (d.entityBbox.height/2.0) - bboxText.top;
//
// 			// drawCircle(xOrigin, yOrigin, 'blue');
//
// 			var xClone = d.entityBoxClonedObject.left + (d.entityBoxClonedObject.width/2.0) - bboxBody.left;// - bboxText.left;
// 			var yClone = d.entityBoxClonedObject.top + (d.entityBoxClonedObject.height/2.0) - bboxText.top;
//
// 			// drawCircle(xClone, yClone, 'blue');
//
// 			// based on this http://stackoverflow.com/questions/15007877/how-to-use-the-d3-diagonal-function-to-draw-curved-lines
// 			var s = {};
// 			s.x = xOrigin;
// 			s.y = yOrigin;
// 			var t = {};
// 			t.x = xClone;
// 			t.y = yClone;
//
// 			var trail = [{source: s, target: t}];
//
// 			var diagonal = d3.svg.diagonal()
// 					.source(function(e) {
// 						console.log(e);
// 						return {"x": e.source.y, "y": e.source.x}; })
// 					.target(function(e) { return {"x": e.target.y, "y": e.target.x}; })
// 					.projection(function(e) { return [e.y, e.x]; });
//
// 			svgContainer.selectAll('.hoverTrail')
// 				.data(trail)
// 				.enter().append('path')
// 				.attr('class', 'hoverTrail')
// 				.attr('d', diagonal);
//
// 		}
// 	});
// }


function draw_connection_line(type, source, target) {

	// console.log(source)
	// console.log(target)

	var svgContainer;

	// added the svg to the root body and not the text div, will make calculation easier
	if (d3.select('body svg.' + type).empty()) {
		var height = Number(d3.select('body').style('height').slice(0, -2))
		var width = Number(d3.select('body').style('width').slice(0, -2))

		svgContainer = d3.select('body').insert('svg', ':first-child')
							.attr('width', width)
							.attr('height', height)
							.attr('class', type);	//
	} else {

		svgContainer = d3.select('body svg.' + type);
	}


	svgContainer.style('position', 'absolute');
	// svg can be clicked through
	svgContainer.style('pointer-events', 'none');
	svgContainer.style('z-index', 410);


	var bboxText = $('#text').offset();
	var bboxBody = $('body').offset();

	var sourceElement;
	var targetElement;

	// console.log(type)
	// console.log(source[0])

	if (type === 'diffLine') {
		// source element
		sourceElement = source;

		// dragged element
		targetElement = target;

	} else {
		$.each(WSV_cloned, function(index, d) {
			if (typeof d.theClonedWSV !== 'undefined' && source[0] === d.theClonedWSV[0]) {

				// console.log('found')

				// origin element
				sourceElement = d.entityBbox;

				// drawCircle(xOrigin, yOrigin, 'blue');
				// cloned element
				targetElement = d.entityBoxClonedObject;

				// to break out of the jQuery loop
				return false;
			}
		});

	}


	var xSource;
	var ySource;
	var xTarget;
	var yTarget;

	// console.log(sourceElement)
	// console.log(bboxBody)

	xSource = sourceElement.left + (sourceElement.width/2.0) - bboxBody.left; //- bboxText.left
	ySource = sourceElement.top + (sourceElement.height/2.0) - bboxText.top;

	// dragged element
	xTarget = targetElement.left + (targetElement.width/2.0) - bboxBody.left; //- bboxText.left;
	yTarget = targetElement.top + (targetElement.height/2.0) - bboxText.top;

	// drawCircle(xClone, yClone, 'blue');

	// based on this http://stackoverflow.com/questions/15007877/how-to-use-the-d3-diagonal-function-to-draw-curved-lines
	var s = {};
	s.x = xSource;
	s.y = ySource;
	var t = {};
	t.x = xTarget;
	t.y = yTarget;


	var lineEndpoints;
	var line;
	if (type === 'hoveringTrail') {

		lineEndpoints = [{'source': s, 'target': t}];

		line = d3.svg.diagonal()
			.source(function(d) { return {"x": d.source.y, "y": d.source.x}; })
			.target(function(d) { return {"x": d.target.y, "y": d.target.x}; })
			.projection(function(d) { return [d.y, d.x]; });

	} else {

		lineEndpoints = [[s, t]];

		line = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; });
	}


	var theLine = svgContainer.selectAll('.' + type)
		.data(lineEndpoints);

	theLine.attr('d', line);

	theLine.enter().append('path')
		.attr('class', type)
		.attr('d', line);

	theLine.exit().remove();
}


function removeTrail() {
	d3.select('body .hoveringTrail .hoverTrail').remove();

	d3.select('body .hoveringTrail').remove();
}


function removeConnectorLine() {
	d3.select('body .connectorLine').remove();
}


function removeAllTrails() {
	d3.selectAll('body .hoveringTrail .hoverTrail').remove();
}
