// all the function that have something to do with the contextual menu

var isContextMenuSetUp = false;
// var contextualMenuVisible = false;

// creates the contextual menu
function createContextualMenu() {

	styleAttr = 'width:width;height:height;'

	var menuDiv = document.createElement("div");
	menuDiv.setAttribute('class', 'mouse tooltip hide');

	if (visibleMenuItems.includes('#close')) {
		var gridLayoutDiv = document.createElement("div");
		// gridLayoutDiv.setAttribute('class', 'box close hide');
		gridLayoutDiv.setAttribute('class', 'box close');
		gridLayoutDiv.setAttribute('id', close_interaction);
		menuDiv.appendChild(gridLayoutDiv);

		var gridImg = document.createElement("img");
		gridImg.setAttribute('class', 'icon');
		gridImg.setAttribute('src', './src/data/close.svg');
		gridImg.setAttribute('alt', close_interaction);
		gridImg.setAttribute('title', close_interaction);
		gridImg.setAttribute('style', styleAttr);
		gridLayoutDiv.appendChild(gridImg);
	}

	if (visibleMenuItems.includes('#grid')) {
		var gridLayoutDiv = document.createElement("div");
		gridLayoutDiv.setAttribute('class', 'box layout');
		gridLayoutDiv.setAttribute('id', grid_layout);
		menuDiv.appendChild(gridLayoutDiv);

		var gridImg = document.createElement("img");
		gridImg.setAttribute('class', 'icon');
		gridImg.setAttribute('src', './src/data/grid4.svg');
		gridImg.setAttribute('alt', grid_layout);
		gridImg.setAttribute('title', grid_layout);
		gridImg.setAttribute('style', styleAttr);
		gridLayoutDiv.appendChild(gridImg);
	}

	if (visibleMenuItems.includes('#column')) {
		var columnLayoutDiv = document.createElement("div");
		columnLayoutDiv.setAttribute('class', 'box layout');
		columnLayoutDiv.setAttribute('id', column_layout);
		menuDiv.appendChild(columnLayoutDiv);

		var columnImg = document.createElement("img");
		columnImg.setAttribute('class', 'icon');
		columnImg.setAttribute('src', './src/data/column3.svg');
		columnImg.setAttribute('alt', column_layout);
		columnImg.setAttribute('title', column_layout);
		columnImg.setAttribute('style', styleAttr);
		columnLayoutDiv.appendChild(columnImg);
	}

	if (visibleMenuItems.includes('#column-pan-aligned')) {
		var columnPanAlignedLayoutDiv = document.createElement("div");
		columnPanAlignedLayoutDiv.setAttribute('class', 'box layout');
		columnPanAlignedLayoutDiv.setAttribute('id', columnPanAligned_layout);
		menuDiv.appendChild(columnPanAlignedLayoutDiv);

		var columnPanAlignedImg = document.createElement("img");
		columnPanAlignedImg.setAttribute('class', 'icon');
		columnPanAlignedImg.setAttribute('src', './src/data/column-pan-aligned2.svg');
		columnPanAlignedImg.setAttribute('alt', columnPanAligned_layout);
		columnPanAlignedImg.setAttribute('title', columnPanAligned_layout);
		columnPanAlignedImg.setAttribute('style', styleAttr);
		columnPanAlignedLayoutDiv.appendChild(columnPanAlignedImg);
	}

	if (visibleMenuItems.includes('#row')) {
		var rowLayoutDiv = document.createElement("div");
		rowLayoutDiv.setAttribute('class', 'box layout');
		rowLayoutDiv.setAttribute('id', row_layout);
		menuDiv.appendChild(rowLayoutDiv);

		var rowImg = document.createElement("img");
		rowImg.setAttribute('class', 'icon');
		rowImg.setAttribute('src', './src/data/row3.svg');
		rowImg.setAttribute('alt', row_layout);
		rowImg.setAttribute('title', row_layout);
		rowImg.setAttribute('style', styleAttr);
		rowLayoutDiv.appendChild(rowImg);
	}

	if (visibleMenuItems.includes('#grid-no-overlap')) {
		var gridNoOverlapLayoutDiv = document.createElement("div");
		gridNoOverlapLayoutDiv.setAttribute('class', 'box layout');
		gridNoOverlapLayoutDiv.setAttribute('id', gridNoOverlap_layout);
		menuDiv.appendChild(gridNoOverlapLayoutDiv);

		var gridNoOverlapImg = document.createElement("img");
		gridNoOverlapImg.setAttribute('class', 'icon');
		gridNoOverlapImg.setAttribute('src', './src/data/no-overlap3.svg');
		gridNoOverlapImg.setAttribute('alt', gridNoOverlap_layout);
		gridNoOverlapImg.setAttribute('title', gridNoOverlap_layout);
		gridNoOverlapImg.setAttribute('style', styleAttr);
		gridNoOverlapLayoutDiv.appendChild(gridNoOverlapImg);
	}

	if (visibleMenuItems.includes('#order-by-lastDataValue')) {
		var orderLastDataValueDiv = document.createElement("div");
		orderLastDataValueDiv.setAttribute('class', 'box sorting');
		orderLastDataValueDiv.setAttribute('id', lastDataValue_sort);
		menuDiv.appendChild(orderLastDataValueDiv);

		var orderLastDataValueImg = document.createElement("img");
		orderLastDataValueImg.setAttribute('class', 'icon');
		orderLastDataValueImg.setAttribute('src', './src/data/sort-val.svg');
		orderLastDataValueImg.setAttribute('alt', lastDataValue_sort);
		orderLastDataValueImg.setAttribute('title', lastDataValue_sort);
		orderLastDataValueImg.setAttribute('style', styleAttr);
		orderLastDataValueDiv.appendChild(orderLastDataValueImg);
	}

	if (visibleMenuItems.includes('#order-by-entityName')) {
		var orderentityNameDiv = document.createElement("div");
		orderentityNameDiv.setAttribute('class', 'box sorting');
		orderentityNameDiv.setAttribute('id', entityName_sort);
		menuDiv.appendChild(orderentityNameDiv);

		var orderentityNameImg = document.createElement("img");
		orderentityNameImg.setAttribute('class', 'icon');
		orderentityNameImg.setAttribute('src', './src/data/sort-alpha.svg');
		orderentityNameImg.setAttribute('alt', entityName_sort);
		orderentityNameImg.setAttribute('title', entityName_sort);
		orderentityNameImg.setAttribute('style', styleAttr);
		orderentityNameDiv.appendChild(orderentityNameImg);
	}

	if (visibleMenuItems.includes('#order-by-docPosition')) {
		var orderdocPositionDiv = document.createElement("div");
		orderdocPositionDiv.setAttribute('class', 'box sorting');
		orderdocPositionDiv.setAttribute('id', docPosition_sort);
		menuDiv.appendChild(orderdocPositionDiv);

		var orderdocPositionImg = document.createElement("img");
		orderdocPositionImg.setAttribute('class', 'icon');
		orderdocPositionImg.setAttribute('src', './src/data/sort-doc.svg');
		orderdocPositionImg.setAttribute('alt', docPosition_sort);
		orderdocPositionImg.setAttribute('title', docPosition_sort);
		orderdocPositionImg.setAttribute('style', styleAttr);
		orderdocPositionDiv.appendChild(orderdocPositionImg);
	}

	if (visibleMenuItems.includes('#selector')) {
		var selectorDiv = document.createElement("div");
		selectorDiv.setAttribute('class', 'box selection');
		selectorDiv.setAttribute('id', select_interaction);
		menuDiv.appendChild(selectorDiv);

		var selectorImg = document.createElement("img");
		selectorImg.setAttribute('class', 'icon');
		selectorImg.setAttribute('src', './src/data/selector.svg');
		selectorImg.setAttribute('alt', select_interaction);
		selectorImg.setAttribute('title', select_interaction);
		selectorImg.setAttribute('style', styleAttr);
		selectorDiv.appendChild(selectorImg);
	}

	if (visibleMenuItems.includes('#selector')) {
		var selectorOKDiv = document.createElement("div");
		selectorOKDiv.setAttribute('class', 'box selection hide');
		selectorOKDiv.setAttribute('id', unselect_interaction);
		menuDiv.appendChild(selectorOKDiv);

		var selectorOKImg = document.createElement("img");
		selectorOKImg.setAttribute('class', 'icon');
		selectorOKImg.setAttribute('src', './src/data/selector-ok.svg');
		selectorOKImg.setAttribute('alt', unselect_interaction);
		selectorOKImg.setAttribute('title', unselect_interaction);
		selectorOKImg.setAttribute('style', styleAttr);
		selectorOKDiv.appendChild(selectorOKImg);
	}

	// append to the body, end of what is there
	document.body.appendChild(menuDiv);
}


// Perform initial setup on the context menu (attaching listeners, etc.)
function setupContextMenu(){
	$('.tooltip').mouseenter(function(event){
		stopMenuHideTimer();
	});

	$('.tooltip').mouseleave(function(event){
		startMenuHideTimer();
	});

	isContextMenuSetUp = true;
}


// Display the context menu for a particular entity
function showContextMenu(elementMenuIsCalledOn) {
	if (!isContextMenuSetUp) {
		setupContextMenu();
	}

	// contextualMenuVisible = true

	stopMenuHideTimer();

	// close icon should be hidden when menu pops up the first time for study1
	if (condition != study2) {
		console.log('hide close icon')
		$('#close').addClass('hide');
	} else {
		unHideCloseIcon()
	}

	var tooltipOffset = -5;

	$('.tooltip').removeClass('hide').addClass('wrapper');
	$('.tooltip').addClass('leftPos');
	$('.tooltip').removeClass('rightPos');


	if ($(elementMenuIsCalledOn).hasClass('showInLayout')) {
		$('#selector-ok').removeClass('hide')
		$('#selector').addClass('hide')
	} else {
		$('#selector-ok').addClass('hide')
		$('#selector').removeClass('hide')
	}

	// compute the tooltip position
	var theEntityBBox = get_BBox_entity($(elementMenuIsCalledOn).parent());
	var widthTooltip = $('.tooltip')[0].getBoundingClientRect().width;
	var heightTooltip = $('.tooltip')[0].getBoundingClientRect().height;
	var tooltip_left = theEntityBBox.left - widthTooltip - tooltipOffset;

	// console.log(theEntityBBox)
	// console.log(widthTooltip)
	// console.log(tooltip_left)


	if (tooltip_left < layoutInfo.viewportLeft) {
		tooltip_left = theEntityBBox.right + tooltipOffset;
		$('.tooltip').removeClass('leftPos');
		$('.tooltip').addClass('rightPos');
	}

	var tooltip_top = theEntityBBox.top - 18;
	var tooltip_bottom = theEntityBBox.bottom + heightTooltip + 5;

	if (tooltip_bottom > (window.innerHeight  + $(window).scrollTop())) {
		tooltip_top = theEntityBBox.top - 5 - heightTooltip;
		$('.tooltip').addClass('topPos');
	}

	// set the position of the tooltip
	$('.tooltip').css('left', tooltip_left);
	$('.tooltip').css('top', tooltip_top);
}


// Hides the menu immediately
function hideContextualMenu() {
	// Don't hide if a layout is being displayed
	var isLayoutVisible = ($('.clonedWSV').length === 0) ? false : true;
	if(!isLayoutVisible) {
		$('.tooltip').removeClass('wrapper')
		$('.tooltip').addClass('hide');

		resetLayoutIcon();

		tmpCurrentEntity = null;
		console.log('set tmpCurrentEntity to null')
	}
	// contextualMenuVisible = false
}


// Internal variables for delayed menu hiding
var menuHideTimer;
var menuHideDelay = 2000;

// Starts the menu hide timer
function startMenuHideTimer(){
	if(menuHideTimer) clearTimeout(menuHideTimer);
	menuHideTimer = setTimeout(hideContextualMenu, menuHideDelay);
}

// Stops the menu hide timer
function stopMenuHideTimer(){
	if(menuHideTimer) clearTimeout(menuHideTimer);
}


function addUsabilityToMenu(elementMenuIsCalledOn) {

	setAllAsSelectableIcons();

	var diffed = $(elementMenuIsCalledOn).hasClass('diffed');

	if (layoutType !== null) {
		// there is a layout, so sorting is possible
		setNotSelectableIcons(['diffing', 'selection']);

	} else {
		// no layout is visible, so no sorting possible
		if (!diffed) {
			setNotSelectableIcons(['diffing','sorting']);
		} else {
			setNotSelectableIcons(['sorting']);
		}

		// // close icon should be hidden when menu pops up the first time
		// if (condition != 'exp2') {
		// 	$('#close').addClass('hide');
		// } else {
		// 	unHideCloseIcon()
		// }
	}
}


/**
 * Goes through the icons of the menu and makes the appropriate icons selectable
 * @param {[string]} hideOfs array of groups of icons that should be made unselectable
 */
function setNotSelectableIcons(hideOfs) {

	$.each(contextualMenuIcons, function(index, icon) {

		var classNames = $(icon).attr('class').split(/\s+/);

		$.each(hideOfs, function(i, aHideOf) {

			if (classNames.indexOf(aHideOf) !== -1) {
				$(icon).addClass('notSelectable');
			}
		});
	});
}


/**
 * makes all icons selectable
 */
function setAllAsSelectableIcons() {

	$.each(contextualMenuIcons, function(i, icon) {
		$(icon).removeClass('notSelectable');
	});
}

/**
 * If there is a layout, the iconClass icons should be selectable
 */
function makeSelectable(iconClass) {

	// if (layoutType !== null) {
		$.each(contextualMenuIcons, function(index, icon) {
			var classNames = $(icon).attr('class').split(/\s+/);

			if (classNames.indexOf(iconClass) !== -1) {
				$(icon).removeClass('notSelectable');
			}
		});
	// }
}


/**
 * If there is a layout, the iconClass icons should not be selectable
 */
function makeNotSelectable(iconClass) {

	if (layoutType !== null) {
		$.each(contextualMenuIcons, function(index, icon) {
			var classNames = $(icon).attr('class').split(/\s+/);

			if (classNames.indexOf(iconClass) !== -1) {
				$(icon).addClass('notSelectable');
			}
		});
	}
}


function resetLayoutIcon() {
	$('.layout').removeClass('hide');
	// $('#close').addClass('hide');
}


/**
 * Hide the current selected layout icon, and make the close icon visible in its place
 */
function hideLayoutIcon() {
	if (condition !== study2) {
		$('.currentSeletedLayout').addClass('hide');
		$('#close').removeClass('hide');
	// } else {
		// $('.currentSeletedLayout').addClass('notSelectable');
	}
}


function hideCloseIcon() {
	console.log('hide close icon')
	$('#close').addClass('hide');
	$('.layout').removeClass('hide');
}

function unHideCloseIcon() {
	$('#close').removeClass('hide');
}


function unSelectIcon() {

	$.each(contextualMenuIcons, function(i, v) {
		$(v).removeClass('currentSeletedLayout');
	});
}
