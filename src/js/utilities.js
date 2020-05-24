// a little helper that could not be added to another file


function comparing2DCoordinates(oldCoordinates, newCoordinates) {

	if ((oldCoordinates.x === newCoordinates.x) && (oldCoordinates.y === newCoordinates.y)) {

		return true;

	} else {

		return false;

	}
}


function add_SuggestedInteractivity(theIcon) {


	switch(theIcon) {
		case row_layout:
			$('#triangle_left').removeClass('hide');
			$('#triangle_left').css('top', layoutInfo.topLeftCorner_top);

			$('#triangle_right').removeClass('hide');
			$('#triangle_right').css('top', layoutInfo.topLeftCorner_top);
			$('#triangle_right').css('left', layoutInfo.viewportRight - 10);

			$('#triangle_left').unbind().click(function(event) {

				console.log('click on left triangle');
				// logStudyEvent('gathering', {'layout': 'row', 'interaction': 'left triangle clicked'});

				// so click in $(html) is not triggered
				event.stopPropagation();
				// event.preventDefault();

				set_up_dynamic_row_layout();
				move_row_wsvs(-(layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells)));

			}).dblclick(function(e){

				/**
				 * Prevent double-click in case of fast animation or sloppy browser.
				 */
				console.log("double-clicked but did nothing");

				e.stopPropagation();
				e.preventDefault();
				return false;
			});


			$('#triangle_right').unbind().click(function(event) {

				console.log('click on right triangle');

				// logStudyEvent('gathering', {'layout': 'row', 'interaction': 'right triangle clicked'});

				// so click in $(html) is not triggered
				event.stopPropagation();
				// event.preventDefault();

				set_up_dynamic_row_layout();
				move_row_wsvs(layoutInfo.cell_dimensions.width + (2*layoutInfo.spaceBetweenGridCells));

			}).dblclick(function(e){

				/**
				 * Prevent double-click in case of fast animation or sloppy browser.
				 */
				console.log("double-clicked but did nothing");

				e.stopPropagation();
				e.preventDefault();
				return false;
			});



			// $('#orientation_circles').removeClass('hide');
			// $('#orientation_circles').css('top', layoutInfo.topLeftCorner_top - 16);
			//
			// // var orientationCirclesData = [];
			// var counter = 0;
			// $('.sparklificated.clonedWSV').each(function(index, value) {
			//
			// 	orientationCirclesData.push({id: counter, hidden: d3.select(this).classed('hide')});
			// 	counter++;
			// });



			break;

		default:
			console.log('no suggested interactivity yet');
	}

}


function updateOrientationCircles() {
	// var radiusCircle = 4;
	//
	// $('.sparklificated.clonedWSV').each(function(index, value) {
	//
	// 	orientationCirclesData[index].hidden = d3.select(this).classed('hide');
	// });
	//
	// var theSVG = d3.select('#orientation_circles svg');
	// if (theSVG.empty()) {
	// 	theSVG = d3.select('#orientation_circles').append('svg')
	// 			.attr('width', (orientationCirclesData.length * ((2*radiusCircle) + (2*2))) + 'px')
	// 			.attr('height', ((2*radiusCircle) + (2*2)) + 'px')
	// 			.attr('class', 'orientation_circles');
	// }
	//
	// var circles = theSVG.selectAll('circle')
	// 		.data(orientationCirclesData);
	//
	//
	// circles.style('fill', function(d) {
	// 	if (d.hidden) {
	// 		return 'white';
	// 	} else {
	// 		return 'black';
	// 	}
	// });
	//
	// circles.enter().append('circle')
	// 	.style('fill', function(d) {
	// 		if (d.hidden) {
	// 			return 'white';
	// 		} else {
	// 			return 'black';
	// 		}})
	// 	.style('stroke', 'black')
	// 	.style('stroke-width', 0.5)
	// 	.attr('r', radiusCircle)
	// 	.attr('cx', function(d, i) { return radiusCircle + (i * ((2*radiusCircle) + (2*2)))})
	// 	.attr('cy', radiusCircle);

}


function remove_SuggestedInteractivity(theLayout) {

	switch(theLayout) {
		case grid_layout:
			$('#triangle_left').addClass('hide');
			$('#triangle_right').addClass('hide');

			$('#orientation_circles').addClass('hide');
			$('#orientation_circles svg').remove();
			orientationCirclesData = [];
			break;
		case column_layout:
			$('#triangle_left').addClass('hide');
			$('#triangle_right').addClass('hide');

			$('#orientation_circles').addClass('hide');
			$('#orientation_circles svg').remove();
			orientationCirclesData = [];
			break;
		case columnPanAligned_layout:
			$('#triangle_left').addClass('hide');
			$('#triangle_right').addClass('hide');

			$('#orientation_circles').addClass('hide');
			$('#orientation_circles svg').remove();
			orientationCirclesData = [];
			break;
		case row_layout:
			break;
		case gridNoOverlap_layout:
			$('#triangle_left').addClass('hide');
			$('#triangle_right').addClass('hide');

			$('#orientation_circles').addClass('hide');
			$('#orientation_circles svg').remove();
			orientationCirclesData = [];
			break;

		default:
			console.log('no suggested interactivity yet');
			$('#triangle_left').addClass('hide');
			$('#triangle_right').addClass('hide');

			$('#orientation_circles').addClass('hide');
			$('#orientation_circles svg').remove();
			orientationCirclesData = [];


	}
}


function cleanupAfterLayout() {
	measurementArray = [];
	WSV_cloned = [];
	currentEntity = null;
	layoutFlag = false;

	// hide tooltip
	hideContextualMenu();

	// reset the contextualMenuIcons, none is selected
	// $.each(contextualMenuIcons, function(i, v) {
	// 	$(v).removeClass('currentSeletedLayout');
	// });
	unSelectIcon();

	$('.currentSeletedLayout').removeClass('currentSeletedLayout')

	$('#triangle_left').addClass('hide');
	$('#triangle_right').addClass('hide');
	$('#orientation_circles').addClass('hide');
	// $('#orientation_circles svg').remove();
	// orientationCirclesData = [];

	layoutInfo.bandLength = 0;
	layoutInfo.startOffsetRowlayout = 0;
	layoutInfo.snapPositions = [];

	// remove any trails
	removeTrail();
}

/*
	file name is build from the title by exchanging spaces with underscores
 */
function getTextFileName() {

	return $.trim($('h2').text()).split(' ').join('_');
}


function getTextTitle() {

	return $.trim($('h2').text());
}


function addSuggestedInteractivityTags() {

	var hideClass = 'hide';

	var orientaionCircleDiv = document.createElement("div");
	orientaionCircleDiv.setAttribute('id', 'orientation_circles');
	orientaionCircleDiv.setAttribute('class', hideClass);
	document.body.appendChild(orientaionCircleDiv);

	var restrictedDragBandDiv = document.createElement("div");
	restrictedDragBandDiv.setAttribute('id', 'restrictedDragBand');
	restrictedDragBandDiv.setAttribute('class', hideClass);
	document.body.appendChild(restrictedDragBandDiv);

	var leftTriangleDiv = document.createElement("div");
	leftTriangleDiv.setAttribute('id', 'triangle_left');
	leftTriangleDiv.setAttribute('class', hideClass);
	document.body.appendChild(leftTriangleDiv);

	var rightTriangleDiv = document.createElement("div");
	rightTriangleDiv.setAttribute('id', 'triangle_right');
	rightTriangleDiv.setAttribute('class', hideClass);
	document.body.appendChild(rightTriangleDiv);
}

// get the data visualized in the sparkline that belongs to anEntity
function getWSVData(anEntity) {
	var wsv_data = d3.select(anEntity.nextSibling).selectAll('g.wsv').datum();

	if (wsv_data.length === 2) {
		console.log('PROBLEM: data has two data arrays, case not handled yet!!!')
	}

	return wsv_data
}


function getGridStartIndex(countsAbove, numberOfColumns) {

	var rest = countsAbove % numberOfColumns;
	if (rest === 0) {
		rest = numberOfColumns;
	}

	return numberOfColumns - rest;
}

// go through all cloned wsv entities and update the original's entity locations
// useful for grid-no-overlap is changed to another layout.
function updateEntityBBox() {
	$.each(WSV_cloned, function(index, d) {

		d.entityBbox = get_BBox_entity(d.anEntity.parent())

	});
}
