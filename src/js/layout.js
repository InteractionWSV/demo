

function remove_currEntityfromMeasureArray(arrayOfWSVMeasurementObjects) {

	var measurementsArray_withoutCurrEntity = arrayOfWSVMeasurementObjects.map(function() {
		if (!$(this.anEntity).hasClass('currentEntity')) {
			return this;
		}
	});

	return measurementsArray_withoutCurrEntity;
}


function changeLayout(type, why)  {
	// getBoundingClientRect() gives position relative to the viewport
	// offset() gives and sets position relative to the document
	// offset().top - $(window).scrollTop() = getBoundingClientRect().top

	//reset animation sequence array
	var mySequence = [];

	// find out if there is already a layout
	var alreadyLayout = ($('.clonedWSV').length === 0) ? false : true;

	// set closest entity as currentEntity if no currentEntity
	if (currentEntity === null) {
		// set_randomCurrentEntity();

		set_closestEntityAsCurrentEntity(dblClickLocation);

		if (currentEntity === null) {
			// no entities in visible space of the page
			alert('an entity needs to be visible to gather charts using double clicking!!');
			return
		}

		// debugging
		// console.log($('.entity.currentEntity').text());

		if (!($('.entity.selected').length > 1)) {
			$('.entity').addClass('selected');
		}
	}

	remove_SuggestedInteractivity(type);

	var currentWSV = $(currentEntity).parent();

	var bbox_currEntity = get_BBox_entity(currentWSV);
	var bbox_currWSV = get_BBox_wsv_NEW(currentWSV, positionType);

	// console.log(bbox_currEntity);
	// console.log(bbox_currWSV);

	if (measurementArray.length === 0) {

		measurementArray = get_allWSV_measurements(positionType);
		var measurementArray_withoutCurrEntity = remove_currEntityfromMeasureArray(measurementArray);

		var cellDimensions = get_cellDimensions(measurementArray);
		layoutInfo.cell_dimensions = cellDimensions;
		// layoutInfo.spaceBetweenGridCells = spaceBetweenGridCells;
		layoutInfo.bbox_currentWSV = bbox_currWSV;

		// console.log(bbox_currWSV)

		// add a flag if element is above or below the current entity
		measurementArray_withoutCurrEntity.each(function() {
			// aboveOrBelow decides if wsv is placed above or below the current entity
			this.aboveOrBelow = (this.entityBbox.top > bbox_currEntity.bottom) ? 'below' : 'above';

			this.docPosition = {'left': this.entityBbox.left + this.entityBbox.width/2.0, 'top': this.entityBbox.top + this.entityBbox.height/2.0}

			if (positionType === 'right') {
				this.middleBoundOffset = bbox_currEntity.width - this.entityBbox.width;

				this.offset_whiteLayer = cellDimensions.width - this.sparklineBbox.width - this.entityBbox.width;
			}

			// also check if 'selected'
			// if selected the wsv (.sparklificated) is pushed into wsv_cloned
			if ($(this.anEntity).hasClass('selected')) {
				// add a distance value between entity and currentEntity
				this.distanceToCurrEntity = bbox_currEntity.top - this.entityBbox.top;


				// push info about the data
				var wsv_data = getWSVData(this.anEntity[0]);

				if (typeof wsv_data.values != 'undefined') {

					var max_value = Math.max.apply(null, wsv_data.values.map(function(v, i) {
							return v.close;
					}));

					this.max_data_value = max_value;

					this.last_data_value = wsv_data.values[wsv_data.values.length - 1]['close']

					var min_value = Math.min.apply(null, wsv_data.values.map(function(v, i) {
							return v.close;
					}));

					this.min_data_value = min_value;

				} else {

					this.max_data_value = 0;
					this.min_data_value = 0;
				}

				this.entityName = this.anEntity.text().toLowerCase();

				WSV_cloned.push(this);
			}

		});

		// order first by above or below, then use x positioning
		// measurementArray_withoutCurrEntity.sort(dl.comparator(['+aboveOrBelow', '+wsvBbox.top']));

		// order the two arrays by their top value then by their left value
		// above_wsvArray.sort(dl.comparator(['+wsvBbox.distanceToCurrEntity', '+wsvBbox.left']));
		// below_wsvArray.sort(dl.comparator(['+wsvBbox.distanceToCurrEntity', '+wsvBbox.left']));
		// above_wsvArray.sort(dl.comparator(['+wsvBbox.distanceToCurrEntity']));
		// below_wsvArray.sort(dl.comparator(['+wsvBbox.distanceToCurrEntity']));

		// order first by above or below, then use x positioning
		WSV_cloned.sort(dl.comparator(['+aboveOrBelow', '-distanceToCurrEntity']));

	} else {
		// link to old (already calculated) cellDimensions
		var cellDimensions = layoutInfo.cell_dimensions
	}





	var rowAndColumnNumbers = spaceAvailability_numberColAndRows(currentWSV, positionType, type, 'middleBound', measurementArray, cellDimensions.width, cellDimensions.height, layoutInfo.spaceBetweenGridCells);
	layoutInfo.rowAndColumnNumbers = rowAndColumnNumbers;


// TODO need to update each layout for changes in layout!!!!!!

	var topLeftCorner_left = 0;

	switch(type) {
		case 'grid':

			layoutInfo.type = 'grid';

			var numOfColumns = rowAndColumnNumbers.leftNumbColumn + rowAndColumnNumbers.currentEntityColumn + rowAndColumnNumbers.rightNumbColumn;
			var numCells_above = numOfColumns * rowAndColumnNumbers.aboveNumbRow;
			var numCells_below = numOfColumns * rowAndColumnNumbers.belowNumbRow;

			layoutInfo.numberOfColumns = numOfColumns;

			// first move wsv up and down if there is not enough space above or below
			// wsv moved up or down are the ones furthest away
			// either maximising space --> overflowing wsv are either moved up or down if space permits
			// if there is no enough space to accomodate all wsv then scrolling is needed
			// var counts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
			// if (counts.above > numCells_above) {
			// 	var numWsvToMoveDown = counts.above - numCells_above;
			//
			// 	// is there space below
			// 	if ((numWsvToMoveDown !== 0) && (counts.below < numCells_below)) {
			//
			// 		var emptyCellsAvailableBelow = numCells_below - counts.below;
			//
			// 		// is space below enough
			// 		if (numWsvToMoveDown <= emptyCellsAvailableBelow) {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, true, numWsvToMoveDown);
			// 			console.log(numWsvToMoveDown + ' wsvs have been moved down');
			// 		} else {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, true, emptyCellsAvailableBelow);
			// 			console.log(emptyCellsAvailableBelow + ' wsvs have been moved down');
			// 			console.log('not all overflowing wsvs from above can be moved down');
			// 		}
			//
			// 	} else {
			// 		console.log('there is no space below to move any wsv down');
			// 	}
			//
			// } else if (counts.below > numCells_below) {
			//
			// 	var numWsvToMoveUp = counts.below - numCells_below
			//
			// 	// is there space below
			// 	if ((numWsvToMoveUp !== 0) && (counts.above < numCells_above)) {
			//
			// 		var emptyCellsAvailableAbove = numCells_above - counts.above;
			//
			// 		// is space below enough
			// 		if (numWsvToMoveUp <= emptyCellsAvailableAbove) {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, false, numWsvToMoveUp);
			// 			console.log(numWsvToMoveUp + ' wsvs have been moved up');
			// 		} else {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, false, emptyCellsAvailableAbove);
			// 			console.log(emptyCellsAvailableAbove + ' wsvs have been moved up');
			// 			console.log('not all overflowing wsvs from below can be moved up');
			// 		}
			//
			// 	} else {
			// 		console.log('there is no space above to move any wsv up');
			// 	}
			// }

			// update the counts variable
			counts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
			setUndefinedCountToZero(counts)
			layoutInfo.counts = counts

			// get top left cornerDiffs
			var numUsedRowsAbove = Math.ceil(counts.above/numOfColumns);
			topLeftCorner_left = 0;

			if (rowAndColumnNumbers.currentEntityColumn === 0) {
				topLeftCorner_left = bbox_currEntity.left + (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells));

			} else {
				 topLeftCorner_left = bbox_currEntity.left - (rowAndColumnNumbers.leftNumbColumn * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
			}

			var topLeftCorner_top = bbox_currWSV.top - (numUsedRowsAbove * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

			layoutInfo.topLeftCorner_left = topLeftCorner_left;
			layoutInfo.topLeftCorner_top = topLeftCorner_top;

			// console.log(above_wsvArray.length);
			// console.log(rowAndColumnNumbers);
			// console.log(topLeftCorner_left);
			// console.log(topLeftCorner_top);

			// drawLine(topLeftCorner_top, 'horizontal', 'green');
			// drawLine(topLeftCorner_left, 'vertical', 'green');
			// drawLine(bbox_currEntity.left, 'vertical')
			// drawLine(bbox_currEntity.top, 'horizontal')


			// make the row above current entity full, means start with the right index
			// var rest = counts.above % numOfColumns;
			// if (rest === 0) {
			// 	rest = numOfColumns;
			// }
			// var startIndex_above = numOfColumns - rest;

			var aboveIndex = getGridStartIndex(counts.above, numOfColumns)
			layoutInfo.startIndex_above = aboveIndex;
			var belowIndex = 0;
			layoutInfo.startIndex_below = belowIndex;
			$.each(WSV_cloned, function(index, value) {

				// cloning the wsv, and changing the position from relative to absolute
				var aClonedWSV;
				if (!alreadyLayout) {
					aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, this.offset_whiteLayer, index);
					this.anEntity.parent().css('opacity', 0.2);
				} else {
					aClonedWSV = this.theClonedWSV;
					$(aClonedWSV).removeClass('hide');
					$(aClonedWSV).children().removeClass('hide');
					if ($('#spacer').length > 0) {
						$('#spacer').remove();
					}
				}

				// // dragging
				// if (typeOfDrag === 'swapDrag') {
				// 	d3.select(aClonedWSV[0]).call(swapDrag);
				// } else {
				// 	d3.select(aClonedWSV[0]).call(dragInBetween);
				// }


				var newTop = 0;
				var newLeft = 0;
				if (this.aboveOrBelow === 'above') {

					newTop = topLeftCorner_top + (Math.floor(aboveIndex/numOfColumns) * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					newLeft = topLeftCorner_left + ((aboveIndex % numOfColumns) * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;

					aboveIndex += 1;

				} else if (this.aboveOrBelow === 'below') {

					newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/numOfColumns) * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					newLeft = topLeftCorner_left + ((belowIndex % numOfColumns) * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;
					belowIndex += 1;

				} else {
					console.log('error with above or below; aboveOrBelow is not defined')
				}


				// check if the wsv has been forced to move due to reordering
				if (why === 'dragInBetween') {
					visualizeMovedWSVs(this, {x: newLeft, y: newTop}, aClonedWSV);
				}



				var whiteBackgroundElement;
				if (!alreadyLayout) {
					whiteBackgroundElement = addWhiteLayer((cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)), (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)), (this.entityBbox.top), (this.entityBbox.left));
				} else {
					// the layout before might have hidden some of the whiteLayer, therefore unhide
					$('.whiteLayer').removeClass('hide');

					whiteBackgroundElement = this.backgroundElement;
					// whiteBackgroundElement.velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells)}, {
					// 	duration: 100
					// });
				}

				if (why === 'dragInBetween') {

					var old_leftTop = {x: this.wsvBoxClonedObject.left, y: this.wsvBoxClonedObject.top};
					var new_leftTop = {x: newLeft, y: newTop};
					var same = comparing2DCoordinates(old_leftTop, new_leftTop);
					if (!same) {
						mySequence.push({e: aClonedWSV, p: {left: (newLeft), top: (newTop)}, o: {
							duration: 500,

							complete: function() {
								WSV_cloned[index].backgroundElement = whiteBackgroundElement;
								WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
								WSV_cloned[index].theClonedWSV = aClonedWSV;
								WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

								d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
								d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
								d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
								d3.select(aClonedWSV[0]).datum().originalIndex = index;
								d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
								$(aClonedWSV).removeClass('compare');
							}
						}});
					}

				} else {

					//{ e: $element1, p: { translateX: 100 }, o: { duration: 1000 } }
					mySequence.push({e: aClonedWSV, p: {left: (newLeft), top: (newTop)}, o: {
						duration: 1000,
						sequenceQueue: false,

						complete: function() {
							WSV_cloned[index].backgroundElement = whiteBackgroundElement;
							WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
							WSV_cloned[index].theClonedWSV = aClonedWSV;
							WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

							d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
							d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
							d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
							d3.select(aClonedWSV[0]).datum().originalIndex = index;
							d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
						}
					}});

					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 1000,
						sequenceQueue: false

						}
					});

				}

				// aClonedWSV.velocity({left: (newLeft), top: (newTop)}, {
				// 	duration: 1000,
				//
				// 	complete: function() {
				// 		WSV_cloned[index].backgroundElement = whiteBackgroundElement;
				// 		WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
				// 		WSV_cloned[index].theClonedWSV = aClonedWSV;
				// 		WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);
				//
				// 		d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
				// 		d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
				// 		d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
				// 		d3.select(aClonedWSV[0]).datum().originalIndex = index;
				// 	}
				// });
			});

			$.Velocity.RunSequence(mySequence);

			$('.sparklificated.clonedWSV.first .entity').css('background-color', 'rgb(255, 223, 128)');

			// logStudyEvent('gathering', {'layout': 'grid', 'origin layout launch (entity)': $.trim($(currentEntity).text()), 'location %': topLeftCorner_top/document.body.scrollHeight});

			// window.innerHeight
			// document.body.scrollHeight

			break;


		case 'column':

			layoutInfo.type = 'column';

			var numOfColumns = 1;
			layoutInfo.numberOfColumns = numOfColumns;

			var numCells_above = numOfColumns * rowAndColumnNumbers.aboveNumbRow;
			var numCells_below = numOfColumns * rowAndColumnNumbers.belowNumbRow;


			// first move wsv up and down if there is not enough space above or below
			// wsv moved up or down are the ones furthest away
			// either maximising space --> overflowing wsv are either moved up or down if space permits
			// if there is no enough space to accomodate all wsv then scrolling is needed
			// var counts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
			// if (counts.above > numCells_above) {
			// 	var numWsvToMoveDown = counts.above - numCells_above;
			//
			// 	// is there space below
			// 	if ((numWsvToMoveDown !== 0) && (counts.below < numCells_below)) {
			//
			// 		var emptyCellsAvailableBelow = numCells_below - counts.below;
			//
			// 		// is space below enough
			// 		if (numWsvToMoveDown <= emptyCellsAvailableBelow) {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, true, numWsvToMoveDown);
			// 			console.log(numWsvToMoveDown + ' wsvs have been moved down');
			// 		} else {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, true, emptyCellsAvailableBelow);
			// 			console.log(emptyCellsAvailableBelow + ' wsvs have been moved down');
			// 			console.log('not all overflowing wsvs from above can be moved down');
			// 		}
			//
			// 	} else {
			// 		console.log('there is no space below to move any wsv down');
			// 	}
			//
			// } else if (counts.below > numCells_below) {
			//
			// 	var numWsvToMoveUp = counts.below - numCells_below;
			//
			// 	// is there space below
			// 	if ((numWsvToMoveUp !== 0) && (counts.above < numCells_above)) {
			//
			// 		var emptyCellsAvailableAbove = numCells_above - counts.above;
			//
			// 		// is space below enough
			// 		if (numWsvToMoveUp <= emptyCellsAvailableAbove) {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, false, numWsvToMoveUp);
			// 			console.log(numWsvToMoveUp + ' wsvs have been moved up');
			// 		} else {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, false, emptyCellsAvailableAbove);
			// 			console.log(emptyCellsAvailableAbove + ' wsvs have been moved up');
			// 			console.log('not all overflowing wsvs from below can be moved up');
			// 		}
			//
			// 	} else {
			// 		console.log('there is no space above to move any wsv up');
			// 	}
			// }


			// update the counts variable
			counts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
			setUndefinedCountToZero(counts)

			// get top left cornerDiffs
			var numUsedRowsAbove = Math.ceil(counts.above/numOfColumns);
			var topLeftCorner_left = bbox_currEntity.left - (rowAndColumnNumbers.leftNumbColumn * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
			topLeftCorner_top = bbox_currWSV.top - (numUsedRowsAbove * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

			layoutInfo.topLeftCorner_left = topLeftCorner_left;
			layoutInfo.topLeftCorner_top = topLeftCorner_top;


			var aboveIndex = 0;
			var belowIndex = 0;
			$.each(WSV_cloned, function(index, value) {

				// cloning the wsv, and changing the position from relative to absolute
				var aClonedWSV;
				if (!alreadyLayout) {
					//aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, this.aboveOrBelow, index);
					aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, this.offset_whiteLayer, index);
					this.anEntity.parent().css('opacity', 0.2);
				} else {
					aClonedWSV = this.theClonedWSV;
					$(aClonedWSV).removeClass('hide');
					$(aClonedWSV).children().removeClass('hide');
					if ($('#spacer').length > 0) {
						$('#spacer').remove();
					}
				}

				// dragging
				// CHANGE removed dragging
				// if (typeOfDrag === 'swapDrag') {
				// 	d3.select(aClonedWSV[0]).call(swapDrag);
				// } else {
				// 	d3.select(aClonedWSV[0]).call(dragInBetween);
				// }


				var newTop = 0;
				var newLeft = topLeftCorner_left + this.middleBoundOffset;
				if (this.aboveOrBelow === 'above') {

					newTop = topLeftCorner_top + (Math.floor(aboveIndex/numOfColumns) * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

					aboveIndex += 1;

				} else if (this.aboveOrBelow === 'below') {

					newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/numOfColumns) * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

					belowIndex += 1;

				} else {
					console.log('error with above or below; aboveOrBelow is not defined')
				}


				if (why === 'dragInBetween') {
					visualizeMovedWSVs(this, {x: newLeft, y: newTop}, aClonedWSV);
				}


				// the wsv position is controlled over the bottom and left of the entity and not the wsv as a whole or the sparkline
				// clonedWSV is the sparklificated span, due to that have to add position plus substract the size of the sparkline


				var whiteBackgroundElement;
				if (!alreadyLayout) {
					// whiteBackgroundElement = addWhiteLayer((cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)), (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)), (newTop - layoutInfo.spaceBetweenGridCells), (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer));
					whiteBackgroundElement = addWhiteLayer((cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)), (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)), (this.entityBbox.top), (this.entityBbox.left));
				} else {
					// the layout beofre might have hidden some of the whiteLayer, therefore unhide
					$('.whiteLayer').removeClass('hide');

					whiteBackgroundElement = this.backgroundElement;
					// whiteBackgroundElement.velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells)}, {
					// 	duration: 100
					// });
				}


				aClonedWSV.velocity({left: (newLeft), top: (newTop)}, {
					duration: 1000,
					queue: false,

					complete: function() {
						WSV_cloned[index].backgroundElement = whiteBackgroundElement;
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

						d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
						d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
						d3.select(aClonedWSV[0]).datum().originalIndex = index;
						d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
					}
				});

				$(whiteBackgroundElement).velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1,
				}, {
					queue: false,
					duration: 1000,
				});

			});

			$('.sparklificated.clonedWSV.first .entity').css('background-color', 'rgb(255, 223, 128)');

			// logStudyEvent('gathering', {'layout': 'column', 'origin layout launch (entity)': $.trim($(currentEntity).text()), 'location %': topLeftCorner_top/document.body.scrollHeight})

			break;


		case 'column-pan-aligned':

			layoutInfo.type = 'column-pan-aligned';

			// drawLine(bbox_currEntity.left, 'vertical', 'red')

			var numOfColumns = 1;
			layoutInfo.numberOfColumns = numOfColumns;

			// above start with the wsv on the right to the current entity
			var numCells_above = numOfColumns * rowAndColumnNumbers.aboveNumbRow;
			var numCells_below = numOfColumns * rowAndColumnNumbers.belowNumbRow;


			// first move wsv up and down if there is not enough space above or below
			// wsv moved up or down are the ones furthest away
			// either maximising space --> overflowing wsv are either moved up or down if space permits
			// if there is no enough space to accomodate all wsv then scrolling is needed
			// var counts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
			// if (counts.above > numCells_above) {
			// 	var numWsvToMoveDown = counts.above - numCells_above;
			//
			// 	// is there space below
			// 	if ((numWsvToMoveDown !== 0) && (counts.below < numCells_below)) {
			//
			// 		var emptyCellsAvailableBelow = numCells_below - counts.below;
			//
			// 		// is space below enough
			// 		if (numWsvToMoveDown <= emptyCellsAvailableBelow) {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, true, numWsvToMoveDown);
			// 			console.log(numWsvToMoveDown + ' wsvs have been moved down');
			// 		} else {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, true, emptyCellsAvailableBelow);
			// 			console.log(emptyCellsAvailableBelow + ' wsvs have been moved down');
			// 			console.log('not all overflowing wsvs from above can be moved down');
			// 		}
			//
			// 	} else {
			// 		console.log('there is no space below to move any wsv down');
			// 	}
			//
			// } else if (counts.below > numCells_below) {
			//
			// 	var numWsvToMoveUp = counts.below - numCells_below
			//
			// 	// is there space below
			// 	if ((numWsvToMoveUp !== 0) && (counts.above < numCells_above)) {
			//
			// 		var emptyCellsAvailableAbove = numCells_above - counts.above;
			//
			// 		// is space below enough
			// 		if (numWsvToMoveUp <= emptyCellsAvailableAbove) {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, false, numWsvToMoveUp);
			// 			console.log(numWsvToMoveUp + ' wsvs have been moved up');
			// 		} else {
			// 			rebalanceAboveAndBelow(WSV_cloned, counts, false, emptyCellsAvailableAbove);
			// 			console.log(emptyCellsAvailableAbove + ' wsvs have been moved up');
			// 			console.log('not all overflowing wsvs from below can be moved up');
			// 		}
			//
			// 	} else {
			// 		console.log('there is no space above to move any wsv up');
			// 	}
			// }


			// update the counts variable
			counts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
			setUndefinedCountToZero(counts)
			// WSV_cloned.sort(dl.comparator(['+aboveOrBelow', '-distanceToCurrEntity']));
			// withContextSort();

			// reference for the alignement
			var referenceClonedWSV
			if (counts.above === 0) {
				// if all the wsvs are below the current entity
				referenceClonedWSV = WSV_cloned[0]
			} else {
				referenceClonedWSV = WSV_cloned[counts.above-1]
			}

			var referenceWidth = referenceClonedWSV.entityBbox.width;
			var referenceWSVWidth = referenceClonedWSV.wsvBbox.width

			// where should the aligned column be put left or right, usually right, but if not enough space left
			var topLeftCorner_left;
			var numUsedRowsAbove = Math.ceil(counts.above/numOfColumns);
			var diffRight = layoutInfo.viewportRight - bbox_currWSV.right;
			var alignedColumnLeft = false;

			if (diffRight >= (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells))) {
				// topLeftCorner_left = bbox_currEntity.left + (rowAndColumnNumbers.rightNumbColumn * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
				topLeftCorner_left = bbox_currEntity.left + (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells));

			} else {
				// topLeftCorner_left = bbox_currEntity.left - (rowAndColumnNumbers.leftNumbColumn * (referenceWSVWidth + (2*layoutInfo.spaceBetweenGridCells)));
				topLeftCorner_left = bbox_currEntity.left - (referenceWSVWidth + (2*layoutInfo.spaceBetweenGridCells));
				alignedColumnLeft = true;
			}


			// drawLine(topLeftCorner_left, 'vertical', 'green')

			// get top left cornerDiffs
			topLeftCorner_top = (bbox_currWSV.bottom + layoutInfo.spaceBetweenGridCells) - (numUsedRowsAbove * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

			layoutInfo.topLeftCorner_left = topLeftCorner_left;
			layoutInfo.topLeftCorner_top = topLeftCorner_top;


			var aboveIndex = 0;
			var belowIndex = 0;
			$.each(WSV_cloned, function(index, value) {

				// cloning the wsv, and changing the position from relative to absolute
				var aClonedWSV;
				if (!alreadyLayout) {
					// aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, this.aboveOrBelow, index);
					aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, this.offset_whiteLayer, index);
					this.anEntity.parent().css('opacity', 0.2);
				} else {
					aClonedWSV = this.theClonedWSV;
					$(aClonedWSV).removeClass('hide');
					$(aClonedWSV).children().removeClass('hide');
					if ($('#spacer').length > 0) {
						$('#spacer').remove();
					}
				}

				// CHANGE removed dragging
				// d3.select(aClonedWSV[0]).call(swapDrag);


				// set the correct offset depending on being aligned left or right (majority of cases)
				var correctionOffset = this.middleBoundOffset;
				if (alignedColumnLeft) {
					correctionOffset = referenceWidth - this.entityBbox.width;
				}


				var newTop = 0;
				var newLeft = 0;
				if (this.aboveOrBelow === 'above') {

					newTop = (topLeftCorner_top + layoutInfo.spaceBetweenGridCells) + (Math.floor(aboveIndex/numOfColumns) * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					// newLeft = topLeftCorner_left + ((aboveIndex % numOfColumns) * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + correctionOffset;
					newLeft = topLeftCorner_left + correctionOffset;

					aboveIndex += 1;

				} else if (this.aboveOrBelow === 'below') {

					newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/numOfColumns) * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					// newLeft = topLeftCorner_left + ((belowIndex % numOfColumns) * (referenceWSVWidth + (2*layoutInfo.spaceBetweenGridCells))) + correctionOffset;
					newLeft = topLeftCorner_left + correctionOffset;


					belowIndex += 1;

				} else {
					console.log('error with above or below; aboveOrBelow is not defined')
				}


				var whiteBackgroundElement;
				if (!alreadyLayout) {
					whiteBackgroundElement = addWhiteLayer((cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)), (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)), (this.entityBbox.top), (this.entityBbox.left));
				} else {
					// the layout beofre might have hidden some of the whiteLayer, therefore unhide
					$('.whiteLayer').removeClass('hide');

					whiteBackgroundElement = this.backgroundElement;
					// whiteBackgroundElement.velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells)}, {
					// 	duration: 100
					// });
				}


				aClonedWSV.velocity({left: (newLeft), top: (newTop)}, {
					duration: 1000,

					complete: function() {
						WSV_cloned[index].backgroundElement = whiteBackgroundElement;
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

						d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
						d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
						d3.select(aClonedWSV[0]).datum().originalIndex = index;
						d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
					}
				});

				$(whiteBackgroundElement).velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1,
				}, {
					queue: false,
					duration: 1000,
				});
			});

			$('.sparklificated.clonedWSV.first .entity').css('background-color', 'rgb(255, 223, 128)');

			// logStudyEvent('gathering', {'layout': 'column-pan-aligned', 'origin layout launch (entity)': $.trim($(currentEntity).text()), 'location %': topLeftCorner_top/document.body.scrollHeight})

			break;


		case 'row':

			//TODO should we distinguish between entities above and below the current entity. If yes how would it be shown?

			layoutInfo.type = 'row';

			layoutInfo.bandLength = 0;
			layoutInfo.startOffsetRowlayout = 0;
			layoutInfo.snapPositions = [];


			var numOfColumns = rowAndColumnNumbers.leftNumbColumn + 1 + rowAndColumnNumbers.rightNumbColumn;
			var numCells_above = numOfColumns * rowAndColumnNumbers.aboveNumbRow;
			var numCells_below = numOfColumns * rowAndColumnNumbers.belowNumbRow;

			layoutInfo.numberOfColumns = numOfColumns;


			// var topLeftCorner_top;
			var topLeftCorner_left = bbox_currEntity.left - (rowAndColumnNumbers.leftNumbColumn * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)));;
			if (numCells_above !== 0) {
				topLeftCorner_top = bbox_currWSV.top - (rowAndColumnNumbers.aboveNumbRow * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
			} else {
				topLeftCorner_top = bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells);
			}


			layoutInfo.topLeftCorner_left = topLeftCorner_left;
			layoutInfo.topLeftCorner_top = topLeftCorner_top;

			$('#restrictedDragBand').removeClass('hide')
									.css('position', 'absolute')
									.offset({top: (topLeftCorner_top - layoutInfo.spaceBetweenGridCells), left: layoutInfo.viewportLeft})
									.width(getBodyBBox().width)
									.height((cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)))
									.css('background-color', 'white');

			// d3.select('#restrictedDragBand').call(restrictedDrag);


			$.each(WSV_cloned, function(index, value) {

				// cloning the wsv, and changing the position from relative to absolute
				var aClonedWSV;
				if (!alreadyLayout) {
					aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, this.offset_whiteLayer, index);
					this.anEntity.parent().css('opacity', 0.2);
				} else {
					aClonedWSV = this.theClonedWSV;

					if ($('#spacer').length > 0) {
						$('#spacer').remove();
					}
				}


				// d3.select(aClonedWSV[0]).call(restrictedDrag);


				var newTop = topLeftCorner_top;
				var newLeft = topLeftCorner_left + (index * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;

				var whiteBackgroundElement;
				if (!alreadyLayout) {
					whiteBackgroundElement = addWhiteLayer((cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)), (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)), (this.entityBbox.top), (this.entityBbox.left));
				} else {
					// the layout beofre might have hidden some of the whiteLayer, therefore unhide
					$('.whiteLayer').removeClass('hide');

					whiteBackgroundElement = this.backgroundElement;
					// whiteBackgroundElement.velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells)}, {
					// 	duration: 100
					// });
				}


				aClonedWSV.velocity({left: (newLeft), top: (newTop)}, {
					duration: 1000,

					complete: function() {
						WSV_cloned[index].backgroundElement = whiteBackgroundElement;

						var clonedWSV_bbox = get_BBox_wsv_NEW(aClonedWSV, positionType);
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = clonedWSV_bbox;

						// save the left and right position for use in the row layout
						// WSV_cloned[index].rowLayoutPositioning = {'left': clonedWSV_bbox.left, 'right': clonedWSV_bbox.right};

						d3.select(aClonedWSV[0]).datum().x = clonedWSV_bbox.left;
						d3.select(aClonedWSV[0]).datum().y = clonedWSV_bbox.top;
						d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;

						// set all left and right for clonedWSV that are hidden to 0 ==> no horizontal scrolling possibl
						// inline styles takes priority over stylesheets

						if (index === 0) {
							$(aClonedWSV).addClass('first');
						// } else if (index === (numOfColumns - 1)) {
						// 	$(aClonedWSV).addClass('last');
						// }
							$(aClonedWSV).children('.entity').css('background-color', '#a6bddb');
						} else if (index === (numOfColumns - 1)) {
							$(aClonedWSV).addClass('last');
						}

						// $('.sparklificated.clonedWSV.first .entity').css('background-color', '#a6bddb');

						if ((clonedWSV_bbox.left < layoutInfo.viewportLeft) || (clonedWSV_bbox.right > layoutInfo.viewportRight)) {
						// if ((clonedWSV_bbox.left > viewportDimensionsLeftRight.x_right) || (clonedWSV_bbox.right < viewportDimensionsLeftRight.x_left)) {

							$(aClonedWSV).addClass('hide');
							$(aClonedWSV).children().addClass('hide');
							$(whiteBackgroundElement).addClass('hide');
						}
					}
				});

				$(whiteBackgroundElement).velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1,
				}, {
					queue: false,
					duration: 1000,
				});

			});

			// console.log('test')
			// add_SuggestedInteractivity();

			// logStudyEvent('gathering', {'layout': 'row', 'origin layout launch (entity)': $.trim($(currentEntity).text()), 'location %': topLeftCorner_top/document.body.scrollHeight})

			break;


		case 'grid-no-overlap':

			layoutInfo.type = 'grid-no-overlap';

			// get the paragraph of the current entity
			var currentEntityParagraph = $(currentEntity).parent().parent();
			currentEntityParagraph.after("<div id='spacer'></div>");

			var numOfColumns = rowAndColumnNumbers.leftNumbColumn + 1 + rowAndColumnNumbers.rightNumbColumn;
			// var numCells_above = numOfColumns * rowAndColumnNumbers.aboveNumbRow;
			// var numCells_below = numOfColumns * rowAndColumnNumbers.belowNumbRow;
			// var numTotal_rows = rowAndColumnNumbers.aboveNumbRow + rowAndColumnNumbers.belowNumbRow;

			var numTotal_rows = Math.floor(WSV_cloned.length/numOfColumns);
			layoutInfo.numberOfColumns = numOfColumns;


			var sizeSmallMultiples = getSizeOfSmallMultiple(numOfColumns, numTotal_rows, cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells), cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells));

			$('#spacer').height(sizeSmallMultiples.height);

			var shiftDown = currentEntityParagraph[0].getBoundingClientRect().bottom + $(window).scrollTop() - (bbox_currWSV.bottom);


			$.each(measurementArray, function(index, value) {
				this.wsvBbox = get_BBox_wsv_NEW($(this.anEntity).parent(), positionType);;
				this.entityBbox = get_BBox_entity($(this.anEntity).parent());
				this.sparklineBbox = get_BBox_sparkline($(this.anEntity).parent());

				var centroidEntity = {x: 0, y: 0};
				centroidEntity.x = this.entityBbox.left + (this.entityBbox.width/2.0);
				centroidEntity.y = this.entityBbox.top + (this.entityBbox.height/2.0);
				this.centroid = centroidEntity;
			});


			// first move wsv up and down if there is not enough space above or below
			// wsv moved up or down are the ones furthest away
			// either maximising space --> overflowing wsv are either moved up or down if space permits
			// if there is no enough space to accomodate all wsv then scrolling is needed



			// get top left cornerDiffs
	// TODO do I need this here. do not think so
			// var numUsedRowsAbove = Math.ceil(above_wsvArray.length/numOfColumns);
			// var topLeftCorner_left = bbox_currEntity.left - (rowAndColumnNumbers.leftNumbColumn * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
			// var topLeftCorner_top = bbox_currWSV.top - (numUsedRowsAbove * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

			// layoutInfo.topLeftCorner_left = topLeftCorner_left;
			// layoutInfo.topLeftCorner_top = topLeftCorner_top;

			// console.log(above_wsvArray.length);
			// console.log(rowAndColumnNumbers);
			// console.log(topLeftCorner_left);
			// console.log(topLeftCorner_top);

			// drawLine(topLeftCorner_top, 'horizontal', 'green');
			// drawLine(topLeftCorner_left, 'vertical', 'green');
			// drawLine(bbox_currEntity.left, 'vertical')
			// drawLine(bbox_currEntity.top, 'horizontal')


			var topLeftCorner_left = bbox_currEntity.left - (rowAndColumnNumbers.leftNumbColumn * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)));

			$.each(WSV_cloned, function(index, value) {

				// cloning the wsv, and changing the position from relative to absolute
				var aClonedWSV;
				if (!alreadyLayout) {
					// aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, 'merged', index);
					aClonedWSV = cloneEntityWithWSV(this.anEntity, this.middleBoundOffset, this.offset_whiteLayer, index);
					this.anEntity.parent().css('opacity', 0.2);
				} else {
					aClonedWSV = this.theClonedWSV;
					$(aClonedWSV).removeClass('hide');
					$(aClonedWSV).children().removeClass('hide');
				}

				// CHANGE removed dragging
				// d3.select(aClonedWSV[0]).call(swapDrag);


				var newTop = bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells) + shiftDown + (Math.floor(index/numOfColumns) * (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

				var newLeft = topLeftCorner_left + ((index % numOfColumns) * (cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;

				var whiteBackgroundElement;
				if (!alreadyLayout) {
					whiteBackgroundElement = addWhiteLayer((cellDimensions.width + (2*layoutInfo.spaceBetweenGridCells)), (cellDimensions.height + (2*layoutInfo.spaceBetweenGridCells)), (this.entityBbox.top), (this.entityBbox.left));
				} else {
					// the layout beofre might have hidden some of the whiteLayer, therefore unhide
					$('.whiteLayer').removeClass('hide');

					whiteBackgroundElement = this.backgroundElement;
					// whiteBackgroundElement.velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells)}, {
					// 	duration: 10
					// });
				}


				aClonedWSV.velocity({left: (newLeft), top: (newTop)}, {
					duration: 1000,

					complete: function() {
						WSV_cloned[index].backgroundElement = whiteBackgroundElement;
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

						d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
						d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
					}
				});

				$(whiteBackgroundElement).velocity({left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1,
				}, {
					queue: false,
					duration: 1000,
				});
			});

			$('.sparklificated.clonedWSV.first .entity').css('background-color', 'rgb(255, 223, 128)');

			// logStudyEvent('gathering', {'layout': 'grid-no-overlap', 'origin layout launch (entity)': $.trim($(currentEntity).text()), 'location %': topLeftCorner_top/document.body.scrollHeight});

			break;

		default:
	 		console.log('there is an error with the layout type!!');
	}

	// set the envirnoment variable to Onnly_cloned so the brushing and linking works
	$('.entity').sparklificator('option', 'environment', 'only_cloned')

	// logging entity name and where the entity is with respect to the document in percent
	// logStudyEvent('from which entity was layout launched', {'entity': $.trim($(currentEntity).text()), 'location %': topLeftCorner_top/document.body.scrollHeight});
	// logStudyEvent('location of entity layout was launched', {});
}


function updateLayout(layoutSort) {
	// update layout after reordering, so assumption, nothing has changed in between e.g. window size etc

	setNotSelectableIcons(['sorting'])

	var currentWSV = $(currentEntity).parent();
	var bbox_currEntity = get_BBox_entity(currentWSV);
	var bbox_currWSV = get_BBox_wsv_NEW(currentWSV, positionType);

	// get currentWSV data
	var wsvData = getWSVData(currentEntity);

	var comparator;
	if (layoutSort === 'lastValue') {
		comparator = wsvData.values[wsvData.values.length - 1]['close'];
	} else if (layoutSort === 'entityName') {
		comparator = $(currentEntity).text().trim().toLowerCase();
	} else if (layoutSort === 'docPosition') {
		comparator = {'left': bbox_currEntity.left + bbox_currEntity.width/2.0, 'top': bbox_currEntity.top + bbox_currEntity.height/2.0};
	}

	var cellDimensions = layoutInfo.cell_dimensions;

	var mySequence = [];

	var aboveIndex = 0;
	var belowIndex = 0;
	var theCounts;
	if (layoutSort === 'lastValue') {

		$.each(WSV_cloned, function(index, value) {

			var currentComparator = this.last_data_value;

			if (currentComparator >= comparator) {
				this.aboveOrBelow = 'above';
			} else {
				this.aboveOrBelow = 'below';
			}
		});

		theCounts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
		setUndefinedCountToZero(theCounts);

		aboveIndex = getGridStartIndex(theCounts.above, layoutInfo.numberOfColumns);

	} else if (layoutSort === 'entityName') {

		$.each(WSV_cloned, function(index, value) {
			// var aClonedWSV = this.theClonedWSV;

			var currentComparator = this.entityName.trim();

			if (currentComparator <= comparator) {
				this.aboveOrBelow = 'above';
			} else {
				this.aboveOrBelow = 'below';
			}
		});

		theCounts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
		setUndefinedCountToZero(theCounts);

		aboveIndex = getGridStartIndex(theCounts.above, layoutInfo.numberOfColumns);

	} else if (layoutSort === 'docPosition') {

		$.each(WSV_cloned, function(index, value) {
			var currentComparator = this.docPosition;

			if (currentComparator.top > comparator.top) {
				this.aboveOrBelow = 'below';
			} else {
				this.aboveOrBelow = 'above';
			}
		});

		theCounts = _.countBy(WSV_cloned, function(v) {return v.aboveOrBelow});
		setUndefinedCountToZero(theCounts);

		aboveIndex = getGridStartIndex(theCounts.above, layoutInfo.numberOfColumns);

	} else {

		aboveIndex = layoutInfo.startIndex_above;
		belowIndex = layoutInfo.startIndex_below;

		theCounts = layoutInfo.counts;
	}

	switch(layoutInfo.type) {
		case 'grid':

			$.each(WSV_cloned, function(index, value) {
				var aClonedWSV = this.theClonedWSV;

				var newTop = 0;
				var newLeft = 0;
				// theCounts = layoutInfo.counts;


				// get top left cornerDiffs
				var numUsedRowsAbove = Math.ceil(theCounts.above/layoutInfo.numberOfColumns);
				var topLeftCorner_left = 0;

				if (layoutInfo.rowAndColumnNumbers.currentEntityColumn === 0) {
					topLeftCorner_left = bbox_currEntity.left + (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells));

				} else {
					 topLeftCorner_left = bbox_currEntity.left - (layoutInfo.rowAndColumnNumbers.leftNumbColumn * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
				}

				var topLeftCorner_top = bbox_currWSV.top - (numUsedRowsAbove * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

				// positioning
				if (index < theCounts.above) {
					newTop = topLeftCorner_top + (Math.floor(aboveIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					newLeft = topLeftCorner_left + ((aboveIndex % layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;

					aboveIndex += 1;

				} else {

					newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					newLeft = topLeftCorner_left + ((belowIndex % layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;

					belowIndex += 1;
				}

				var whiteBackgroundElement = this.backgroundElement;
				// white background element follows the cloned wsv.
				// this.backgroundElement.changeWhiteLayerPosition

				$(whiteBackgroundElement).css('z-index', (300 + index));
				$(this.theClonedWSV).css('z-index', 400);

				mySequence.push({e: aClonedWSV, p: {left: (newLeft), top: (newTop)}, o: {
					duration: 10,

					complete: function() {
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						// WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

						d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
						// d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
						d3.select(aClonedWSV[0]).datum().originalIndex = index;
						// d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
					}
				}});

				if (index === WSV_cloned.length - 1) {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false,
						complete: function() { makeSelectable('sorting'); }
						}
					});
				} else {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false

						}
					});
				}
			});

			$.Velocity.RunSequence(mySequence);
			break;

		case 'column':

			$.each(WSV_cloned, function(index, value) {
				var aClonedWSV = this.theClonedWSV;

				var newTop = 0;
				var newLeft = 0;

				// get top left cornerDiffs
				var numUsedRowsAbove = Math.ceil(theCounts.above/layoutInfo.numberOfColumns);
				var topLeftCorner_left = 0;

				if (layoutInfo.rowAndColumnNumbers.currentEntityColumn === 0) {
					topLeftCorner_left = bbox_currEntity.left + (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells));

				} else {
					 topLeftCorner_left = bbox_currEntity.left - (layoutInfo.rowAndColumnNumbers.leftNumbColumn * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
				}

				var topLeftCorner_top = bbox_currWSV.top - (numUsedRowsAbove * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

				// positioning
				var newLeft = topLeftCorner_left + this.middleBoundOffset;
				if (index < theCounts.above) {
					newTop = topLeftCorner_top + (Math.floor(aboveIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

					aboveIndex += 1;

				} else {

					newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

					belowIndex += 1;
				}

				var whiteBackgroundElement = this.backgroundElement;
				// white background element follows the cloned wsv.
				// this.backgroundElement.changeWhiteLayerPosition

				$(whiteBackgroundElement).css('z-index', (300 + index));
				$(this.theClonedWSV).css('z-index', 400);

				mySequence.push({e: aClonedWSV, p: {left: (newLeft), top: (newTop)}, o: {
					duration: 10,

					complete: function() {
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						// WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

						d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
						// d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
						d3.select(aClonedWSV[0]).datum().originalIndex = index;
						// d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
					}
				}});

				if (index === WSV_cloned.length - 1) {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false,
						complete: function() { makeSelectable('sorting'); }
						}
					});
				} else {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false

						}
					});
				}
			});

			$.Velocity.RunSequence(mySequence);
			break;

		case 'column-pan-aligned':

			// reference for the alignement
			var referenceClonedWSV
			if (theCounts.above === 0) {
				// if all the wsvs are below the current entity
				referenceClonedWSV = WSV_cloned[0]
			} else {
				referenceClonedWSV = WSV_cloned[theCounts.above-1]
			}

			var referenceWidth = referenceClonedWSV.entityBbox.width;
			var referenceWSVWidth = referenceClonedWSV.wsvBbox.width


			$.each(WSV_cloned, function(index, value) {
				var aClonedWSV = this.theClonedWSV;

				var newTop = 0;
				var newLeft = 0;

				// get top left cornerDiffs
				var numUsedRowsAbove = Math.ceil(theCounts.above/layoutInfo.numberOfColumns);
				var topLeftCorner_left = 0;

				var diffRight = layoutInfo.viewportRight - bbox_currWSV.right;
				var alignedColumnLeft = false;

				if (diffRight >= (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells))) {
					topLeftCorner_left = bbox_currEntity.left + (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells));

				} else {
					//  topLeftCorner_left = bbox_currEntity.left - (layoutInfo.rowAndColumnNumbers.leftNumbColumn * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
					topLeftCorner_left = bbox_currEntity.left - (referenceWSVWidth + (2*layoutInfo.spaceBetweenGridCells));
					alignedColumnLeft = true;
				}

				var topLeftCorner_top = bbox_currWSV.top - (numUsedRowsAbove * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

				// set the correct offset depending on being aligned left or right (majority of cases)
				var correctionOffset = this.middleBoundOffset;
				if (alignedColumnLeft) {
					correctionOffset = referenceWidth - this.entityBbox.width;
				}

				// positioning
				if (this.aboveOrBelow === 'above') {

					newTop = (topLeftCorner_top + layoutInfo.spaceBetweenGridCells) + (Math.floor(aboveIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					newLeft = topLeftCorner_left + correctionOffset;

					aboveIndex += 1;

				} else if (this.aboveOrBelow === 'below') {

					newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
					newLeft = topLeftCorner_left + correctionOffset;


					belowIndex += 1;
				}

				// var newLeft = topLeftCorner_left + this.middleBoundOffset;
				// if (index < theCounts.above) {
				// 	newTop = topLeftCorner_top + (Math.floor(aboveIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
				//
				// 	aboveIndex += 1;
				//
				// } else {
				//
				// 	newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
				//
				// 	belowIndex += 1;
				// }

				var whiteBackgroundElement = this.backgroundElement;
				// white background element follows the cloned wsv.
				// this.backgroundElement.changeWhiteLayerPosition

				$(whiteBackgroundElement).css('z-index', (300 + index));
				$(this.theClonedWSV).css('z-index', 400);

				mySequence.push({e: aClonedWSV, p: {left: (newLeft), top: (newTop)}, o: {
					duration: 10,

					complete: function() {
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						// WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

						d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
						// d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
						d3.select(aClonedWSV[0]).datum().originalIndex = index;
						// d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
					}
				}});

				if (index === WSV_cloned.length - 1) {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false,
						complete: function() { makeSelectable('sorting'); }
						}
					});
				} else {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false

						}
					});
				}
			});

			$.Velocity.RunSequence(mySequence);
			break;

		case 'row':

			var topLeftCorner_left = bbox_currEntity.left - (layoutInfo.rowAndColumnNumbers.leftNumbColumn * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)));;

			if (theCounts.above !== 0) {
				topLeftCorner_top = bbox_currWSV.top - (layoutInfo.rowAndColumnNumbers.aboveNumbRow * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
			} else {
				topLeftCorner_top = bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells);
			}

			$.each(WSV_cloned, function(index, aWSV_Info) {
				var aClonedWSV = this.theClonedWSV;

				var newTop = 0;
				var newLeft = 0;


				newTop = topLeftCorner_top;
				newLeft = topLeftCorner_left + (index * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;


				var whiteBackgroundElement = this.backgroundElement;

				d3.select(aClonedWSV[0]).classed('hide', false);
				d3.select(aClonedWSV.children()[0]).classed('hide', false);
				d3.select(aClonedWSV.children()[1]).classed('hide', false);
				d3.select(whiteBackgroundElement[0]).classed('hide', false);

				$(whiteBackgroundElement).css('z-index', (300 + index));
				$(aClonedWSV).css('z-index', 400);

				if (index === 0) {
					$(aClonedWSV).addClass('first');
					$(aClonedWSV).children('.entity').css('background-color', '#a6bddb');
				} else if (index === (WSV_cloned.length - 1)) {
					$(aClonedWSV).addClass('last');
				} else {
					$(aClonedWSV).removeClass('first');
					$(aClonedWSV).removeClass('last');
					$(aClonedWSV).children('.entity').css('background-color', 'rgb(255, 223, 128)');
				}



				mySequence.push({e: aClonedWSV, p: {left: (newLeft), top: (newTop)}, o: {
					duration: 10,

					complete: function() {
						aWSV_Info.entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						var clonedWSV_bbox = get_BBox_wsv_NEW(aClonedWSV, positionType);
						aWSV_Info.wsvBoxClonedObject = clonedWSV_bbox;

						d3.select(aClonedWSV[0]).datum().x = aWSV_Info.wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = aWSV_Info.wsvBoxClonedObject.top;
						d3.select(aClonedWSV[0]).datum().originalIndex = index;

						// if ((newLeft < layoutInfo.viewportLeft) || (newLeft + layoutInfo.cell_dimensions['width'] > layoutInfo.viewportRight)) {
						//
						// 	d3.select(aClonedWSV[0]).classed('hide', true);
						// 	d3.select(aClonedWSV[0]).selectAll('.clonedWSV').classed('hide', true);
						// }

						if ((clonedWSV_bbox.left < layoutInfo.viewportLeft) || (clonedWSV_bbox.right > layoutInfo.viewportRight)) {
							$(aClonedWSV).addClass('hide');
							$(aClonedWSV).children().addClass('hide');
							$(whiteBackgroundElement).addClass('hide');
						}
					}
				}});

				if (index === WSV_cloned.length - 1) {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false,
						complete: function() { makeSelectable('sorting'); }
						}
					});
				} else {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false

						}
					});
				}

			});


			$.Velocity.RunSequence(mySequence);
			break;

		case 'grid-no-overlap':

			$.each(WSV_cloned, function(index, value) {
				var aClonedWSV = this.theClonedWSV;

				var newTop = 0;
				var newLeft = 0;
				// theCounts = layoutInfo.counts;


				// get top left cornerDiffs
				var numUsedRowsAbove = Math.ceil(theCounts.above/layoutInfo.numberOfColumns);
				// var topLeftCorner_left = 0;

				var currentEntityParagraph = $(currentEntity).parent().parent();
				var shiftDown = currentEntityParagraph[0].getBoundingClientRect().bottom + $(window).scrollTop() - (bbox_currWSV.bottom);

				// if (layoutInfo.rowAndColumnNumbers.currentEntityColumn === 0) {
				// 	topLeftCorner_left = bbox_currEntity.left + (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells));
				//
				// } else {
				// 	 topLeftCorner_left = bbox_currEntity.left - (layoutInfo.rowAndColumnNumbers.leftNumbColumn * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)));
				// }

				// var topLeftCorner_top = bbox_currWSV.top - (numUsedRowsAbove * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
				var topLeftCorner_left = bbox_currEntity.left - (layoutInfo.rowAndColumnNumbers.leftNumbColumn * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)));


				// positioning
				var newTop = bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells) + shiftDown + (Math.floor(index/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));

				var newLeft = topLeftCorner_left + ((index % layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;
				// if (index < theCounts.above) {
				// 	newTop = topLeftCorner_top + (Math.floor(aboveIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
				// 	newLeft = topLeftCorner_left + ((aboveIndex % layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;
				//
				// 	aboveIndex += 1;
				//
				// } else {
				//
				// 	newTop = (bbox_currWSV.bottom + (2*layoutInfo.spaceBetweenGridCells)) + (Math.floor(belowIndex/layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.height + (2*layoutInfo.spaceBetweenGridCells)));
				// 	newLeft = topLeftCorner_left + ((belowIndex % layoutInfo.numberOfColumns) * (layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells))) + this.middleBoundOffset;
				//
				// 	belowIndex += 1;
				// }

				var whiteBackgroundElement = this.backgroundElement;
				// white background element follows the cloned wsv.
				// this.backgroundElement.changeWhiteLayerPosition

				$(whiteBackgroundElement).css('z-index', (300 + index));
				$(this.theClonedWSV).css('z-index', 400);

				mySequence.push({e: aClonedWSV, p: {left: (newLeft), top: (newTop)}, o: {
					duration: 10,

					complete: function() {
						WSV_cloned[index].entityBoxClonedObject = get_BBox_entity(aClonedWSV);
						// WSV_cloned[index].theClonedWSV = aClonedWSV;
						WSV_cloned[index].wsvBoxClonedObject = get_BBox_wsv_NEW(aClonedWSV, positionType);

						d3.select(aClonedWSV[0]).datum().x = WSV_cloned[index].wsvBoxClonedObject.left;
						d3.select(aClonedWSV[0]).datum().y = WSV_cloned[index].wsvBoxClonedObject.top;
						// d3.select(aClonedWSV[0]).datum().middleBoundOffset = WSV_cloned[index].middleBoundOffset;
						d3.select(aClonedWSV[0]).datum().originalIndex = index;
						// d3.select(aClonedWSV[0]).datum().backgroundElement = whiteBackgroundElement;
					}
				}});

				if (index === WSV_cloned.length - 1) {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false,
						complete: function() { makeSelectable('sorting'); }
						}
					});
				} else {
					mySequence.push({e: whiteBackgroundElement, p: {left: (newLeft - layoutInfo.spaceBetweenGridCells - this.offset_whiteLayer), top: (newTop - layoutInfo.spaceBetweenGridCells), opacity: 1}, o: {
						duration: 10,
						sequenceQueue: false

						}
					});
				}
			});

			$.Velocity.RunSequence(mySequence);
			break;

		default:
			console.log('update does not yet work for this layout');
			makeSelectable('sorting');
	}

}



function addWhiteLayer(width, height, oldTop, oldLeft) { //newTop, newLeft) {

	var whiteLayerBox = $("<div class='whiteLayer'></div>");

	$('#text').append(whiteLayerBox);

	$(whiteLayerBox).css('position', 'absolute');
	$(whiteLayerBox).css('opacity', 0);
	$(whiteLayerBox).width(width);
	$(whiteLayerBox).height(height);
	$(whiteLayerBox).offset({top: oldTop, left: oldLeft});
	$(whiteLayerBox).css('z-index', 4);
	$(whiteLayerBox).css('pointer-events', 'none');

	return whiteLayerBox;
}


// function changeWhiteLayerPosition(newTop, newLeft) {
// 	console.log(this)
// 	$(this).offset({top: newTop, left: newLeft});
// }


// function getClosestCornerCoordinates(oldCoordinates_centroid, newCoordinates_positions) {
//
// 	var leftUpperCorner_new = {'x': (newCoordinates_positions.left), 'y': (newCoordinates_positions.top)};
// 	var rightUpperCorner_new = {'x': (newCoordinates_positions.right), 'y': (newCoordinates_positions.top)};
// 	var leftLowerCorner_new = {'x': (newCoordinates_positions.left), 'y': (newCoordinates_positions.bottom)};
// 	var rightLowerCorner_new = {'x': (newCoordinates_positions.right), 'y': (newCoordinates_positions.bottom)};
//
// 	var leftUpperDiff_x = Math.abs(oldCoordinates_centroid.x - leftUpperCorner_new.x);
// 	var leftUpperDiff_y = Math.abs(oldCoordinates_centroid.y - leftUpperCorner_new.y);
// 	var rightUpperDiff_x = Math.abs(oldCoordinates_centroid.x - rightUpperCorner_new.x);
// 	var rightUpperDiff_y = Math.abs(oldCoordinates_centroid.y - rightUpperCorner_new.y);
// 	var leftLowerDiff_x = Math.abs(oldCoordinates_centroid.x - leftLowerCorner_new.x);
// 	var leftLowerDiff_y = Math.abs(oldCoordinates_centroid.y - leftLowerCorner_new.y);
// 	var rightLowerDiff_x = Math.abs(oldCoordinates_centroid.x - rightLowerCorner_new.x);
// 	var rightLowerDiff_y = Math.abs(oldCoordinates_centroid.y - rightLowerCorner_new.y);
//
// 	var cornerDiffs = [{'whichDiff': 'leftUpperDiff', 'diff': Math.sqrt((leftUpperDiff_x*leftUpperDiff_x) + (leftUpperDiff_y*leftUpperDiff_y))}, {'whichDiff': 'rightUpperDiff', 'diff': Math.sqrt((rightUpperDiff_x*rightUpperDiff_x) + (rightUpperDiff_y*rightUpperDiff_y))}, {'whichDiff': 'leftLowerDiff', 'diff': Math.sqrt((leftLowerDiff_x*leftLowerDiff_x) + (leftLowerDiff_y*leftLowerDiff_y))}, {'whichDiff': 'rightLowerDiff', 'diff': Math.sqrt((rightLowerDiff_x*rightLowerDiff_x) + (rightLowerDiff_y*rightLowerDiff_y))}];
//
// 	var minDiff = _.min(cornerDiffs, 'diff');
//
// 	if (minDiff.whichDiff === 'leftUpperDiff') {
// 		return leftUpperCorner_new;
// 	} else if (minDiff.whichDiff === 'rightUpperDiff') {
// 		return rightUpperCorner_new;
// 	} else if (minDiff.whichDiff === 'leftLowerDiff') {
// 		return leftLowerCorner_new;
// 	} else if (minDiff.whichDiff === 'rightLowerDiff') {
// 		return rightLowerCorner_new;
// 	}
// }


function giveUpLayout(doNotDealWSV = null) {

	var giveUpAnimationSequence = []

	var allClonedSparklificated = $('.clonedWSV.sparklificated').not(doNotDealWSV);

	allClonedSparklificated.each(function(i, d) {

		var $d = $(d)

		if (doNotDealWSV === d) {
			// a wsv has been double clicked; not a regular give up layout
			return true;
		}

		var originalWSV_pos = $d.prev().offset();

		var whiteBackgroundElement = d3.select(d).datum().backgroundElement[0];

		giveUpAnimationSequence.push({e: $d,
													p: {left: originalWSV_pos.left, top: originalWSV_pos.top},
													o: {sequenceQueue: false, duration: 800, complete: function() {
																	$(this).children().remove();
																}
															}
												});

		if($d[0] === allClonedSparklificated.last()[0]) {
			// $d is the last one
			giveUpAnimationSequence.push({e: $(whiteBackgroundElement),
														p: {left: originalWSV_pos.left, top: originalWSV_pos.top, opacity: 0},
														o: {sequenceQueue: false, duration: 800, complete: function() {
																		$(this).remove();

																		$('#text').css('color', 'rgb(51, 51, 51)');

																		$('.sparklificated').css('opacity', 1);
																		$('.sparkline').css('opacity', 1);
																		$('.entity').css('opacity', 1);

																		$('.entity').removeClass('selected');
																		$('.entity').removeClass('currentEntity');
																		$('.entity').removeClass('showInLayout');

																		currentEntity = null;

																		layoutType = null;

																		// if (!goingBackAnimationRunning && $('#spacer').length > 0) {
																		// 	$('#spacer').remove();
																		// }

																		// if ($('#spacer').length > 0) {
																		// 	$('#spacer').remove();
																		// }

																		hideDragBand();
																	}
																}
													});

		} else {

			giveUpAnimationSequence.push({e: $(whiteBackgroundElement),
														p: {left: originalWSV_pos.left, top: originalWSV_pos.top, opacity: 0},
														o: {sequenceQueue: false, duration: 800, complete: function() {
																		$(this).remove();
																	}
																}
													});
		}
	});

	$.Velocity.RunSequence(giveUpAnimationSequence);

	setLayoutType(null, 'giveUp');

	$('.entity').sparklificator('option', 'environment', 'not_cloned')
}


function hideDragBand() {
	$('#restrictedDragBand').velocity({
			opacity: 0
		}, {
			queue: false,

			complete: function() {
				$('#restrictedDragBand').addClass('hide');
			}
		});
}


function removeSpacer() {
	$('#spacer').remove();

	// change the entityBbox as the spacer was removed
	updateEntityBBox();
}


function rebalanceAboveAndBelow(arrayOfWSVs, counts, moveBelow, howMany) {
	// arrayOfWSVs first above wsvs, then below wsvs

	if (moveBelow) {
		// means move wsvs from above to below
		var i = counts.above - 1;
		var end = i - howMany;
		while (i != end) {

			arrayOfWSVs[i].aboveOrBelow = 'below';

			i -= 1;
		}
	} else {

		// means move wsvs from below to above
		var i = arrayOfWSVs.length - 1;
		var end = i - howMany;
		while (i != end) {

			arrayOfWSVs[i].aboveOrBelow = 'above';

			i -= 1;
		}
	}

	arrayOfWSVs.sort(dl.comparator(['+aboveOrBelow', '-distanceToCurrEntity']));
}

function setUndefinedCountToZero(theCounts) {

	if (theCounts.above === undefined) {
		theCounts.above = 0;
	}

	if (theCounts.below === undefined) {
		theCounts.below = 0;
	}
}

function visualizeMovedWSVs(WSVCloned_element, new_leftTop, theClonedWSV) {
	// store old positioning
	var old_leftTop = {x: WSVCloned_element.wsvBoxClonedObject.left, y: WSVCloned_element.wsvBoxClonedObject.top};

	var comparison = comparing2DCoordinates(old_leftTop, new_leftTop);


	if (!comparison) {
		// $(theClonedWSV).css('border-style', 'solid');
		// $(theClonedWSV).css('border-color', 'green');
		// $(theClonedWSV).css('border-width', '2px');

		$(theClonedWSV).addClass('compare');


		// var svgContainer;
		//
		// // added the svg to the root body and not the text div, will make calculation easier
		// if (d3.select('html svg.dragMovements').empty()) {
		// 	svgContainer = d3.select('html').insert('svg', ':first-child')
		// 						.attr('width', $('html').width())
		// 						.attr('height', $('html').height())
		// 						.attr('class', 'dragMovements');
		// } else {
		//
		// 	svgContainer = d3.select('html svg.dragMovements');
		// }
		//
		//
		// svgContainer.style('position', 'absolute');
		// // svg can be clicked through
		// svgContainer.style('pointer-events', 'none');
		// svgContainer.style('z-index', 15);
		//
		//
		// var movement = [{'x': old_leftTop.x, 'y': old_leftTop.y}, {'x': new_leftTop.x, 'y': new_leftTop.y}];
		//
		//
		// svgContainer.append('line')
		// 	.attr('x1', movement[0].x)
		// 	.attr('y1', movement[0].y)
		// 	.attr('x2', movement[1].x)
		// 	.attr('y2', movement[1].y)
		// 	.attr('class', 'wsvMovement');
	}
}



/*
function addListeners(element) {

	// element.addEventListener('click', function(event) {
	//
	// 	if ((!$(event.target).parent().hasClass('entity')) && (!$(event.target).hasClass('entity'))) {
	// 		console.log("event: click (give up layout)");
	// 		giveUpLayout();
	// 		layoutFlag = false;
	// 	}
	// });
*/

	/* events fired on the draggable target */
/*
	element.addEventListener('drag', function( event ) {

	}, false);


	element.addEventListener('dragstart', function( event ) {
	    // store a ref. on the dragged elem
	    dragged = event.target;
	    // make it half transparent
	    event.target.style.opacity = '.5';

	    d3.select(event.target).select('.gChart .wsv').classed('movedWSV', true);


	    if (event.shiftKey) {
	        // shift key is involved do the comparison diff thing

	        console.log('shift key used')
	        console.log(dragged)

	        // get the sparkline data
	        // var data_array = d3.select(dragged).selectAll('g.bar').data();
	        var data_array = d3.select(dragged).selectAll('g.wsv').data()[0].values;
	        var data_string = $.map(data_array, function(value, index) {
	            return value;
	        }).join(',');

	        event.dataTransfer.setData('Text', data_string);

	    } else if (event.altKey) {

			// get the wsv (whole element)
			console.log('test')
			var draggedWSV = dragged.parentElement;
			// store its position
			draggedWSV_toReorder_position = $(draggedWSV).offset();

		} else {
	        // if shift is not involved then do the menu thing

	        set_currentEntity(dragged);

	        dragStart_position.x = event.screenX;
	        dragStart_position.y = event.screenY;

	        horizontalPoint_position.x = event.screenX + 100;
	        horizontalPoint_position.y = event.screenY;
	    }

	}, false);


	element.addEventListener('dragend', function( event ) {
	    // reset the transparency
	    event.target.style.opacity = '1';

	    if (!event.shiftKey && !event.altKey) {
	        dragEnd_position.x = event.screenX;
	        dragEnd_position.y = event.screenY;

	        var angle = dragAngle(dragStart_position, dragEnd_position, horizontalPoint_position);
	        console.log(angle);
	        console.log((angle * 180)/Math.PI);

	        var diff_x = dragEnd_position.x - dragStart_position.x;
	        var diff_y = dragEnd_position.y - dragStart_position.y;

	        if ((diff_x > 0) && (diff_y > 0) && (angle >= 0) && (angle < (Math.PI/2.0))) {

	            // $('.entity').css('background-color', 'red');
	            layout('onlyHorizontal');

	        }  else if ((diff_x > 0) && (diff_y < 0) && (angle >= 0) && (angle < (Math.PI/2.0))) {

	            // $('.entity').css('background-color', 'yellow');
	            layout('onlyVertical');

	        } else if ((diff_x < 0) && (diff_y > 0) && (angle >= (Math.PI/2.0)) && (angle <= Math.PI)) {

	            // $('.entity').css('background-color', 'blue');
	            // layout('horizontal_+_splitText');
	            layout('horizontal_+_splitText_special');

	        }  else if ((diff_x < 0) && (diff_y < 0) && (angle >= (Math.PI/2.0)) && (angle <= Math.PI)) {

	            $('.entity').css('background-color', 'green');

	        }
		} else if (event.altKey) {

			console.log('test 2')


	    } else {

	        console.log('shift key used');
	    }

	}, false);


	// By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
	element.addEventListener("dragover", function(event) {
	    event.preventDefault();
	});


	element.addEventListener('dragenter', function(event) {

	    if ( event.target.className.baseVal == 'barChart' || event.target.className.baseVal == 'lineChart' ) {
	        // console.log('test2')
	        event.target.style.border = '3px dotted red';
	    }
	});


	element.addEventListener('dragleave', function(event) {
	    if ( event.target.className.baseVal == 'barChart' || event.target.className.baseVal == 'lineChart' ) {
	        event.target.style.border = '';
	    }
	});


	element.addEventListener('drop', function(event) {
	    event.preventDefault();

	    if (event.target.className.baseVal == 'barChart' || event.target.className.baseVal == 'lineChart') {
	        event.target.style.border = '';


	        var dataAsString = event.dataTransfer.getData('Text');
	        var dataAsStringArray = dataAsString.split(',');
	        var dataAsNumbersArray = $.map(dataAsStringArray, function(value, index) {
	            return parseFloat(value, 10);
	        });

	        var oldData = d3.select(event.target).selectAll('g.wsv').data();
	        oldData[0].name = 'first';


	        var newDataArray = oldData.push({name: 'second', values: dataAsNumbersArray});

	        if (event.target.className.baseVal == 'barChart') {

	            barChart($(event.target).parent(), (6 * oldData.length * numberOfMarks), sizeWordScaleVis, false, oldData);

	        } else if (event.target.className.baseVal == 'lineChart') {

	            classicSparkline($(event.target).parent(), (4 * numberOfMarks), sizeWordScaleVis, false, oldData);

	        }

	        console.log('theData: ' + dataAsNumbersArray)
	    }
	});
}
*/
