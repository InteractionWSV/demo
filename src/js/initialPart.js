// settings

// Disable Ctrl+F Search within docs
window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 70){
        e.preventDefault();
    }
})

// when everything is loaded then make the text visible
window.onload = function () {
    $('#document').css('visibility', 'visible');

    var entityToBeSearched = $(window.parent.document).find('#taskHolder .taskPage:visible .instructionsText b').text();
    if (entityToBeSearched != '') {
      var actualWSV = $('.entity:contains(' + entityToBeSearched + ')').parent();
      var sparklineTop = get_BBox_sparkline(actualWSV).top;
      // logStudyEvent('general text info', {'position of entity searched for': sparklineTop/document.body.scrollHeight});
    }
}

const defaultAllowedInteractions = 'sorting,dblclickOnWSVToGetBack,lineToWSVOrigin';
const defaultCondition = 'exp2';

const queryParams = getQueryParams();

let condition = defaultCondition;
let allowedInteractions = defaultAllowedInteractions.split(",");

if (!$.isEmptyObject(queryParams)) {
  condition = queryParams["condition"];
  allowedInteractions = queryParams["allowedInteractions"].split(",");
}


allowedInteractions = allowedInteractions.map(function(elem) {
  return elem.trim();
});

console.log(condition);
console.log(allowedInteractions);


// const datasets = {'test': 'stockData', 'A_Historian_Note': 'historianData', 'Analysis_of_Eye_Movement_Data': 'eyetracking'}
const datasets = {'Stocks halt 2-day skid as bank shares offset energy selloff ahead of big Thursday': 'stockData', 'A Historian Note': 'historianData', 'Analysis of Eye Movement Data': 'eyetracking'}
// var theFileName = getTextFileName();
var theTextTitle = getTextTitle();
var currentDataset = datasets[theTextTitle];

var positionType = 'right';
var typeOfWSV = 'lineChart';
// var typeOfWSV = 'barChart';
if (currentDataset == 'historianData') {
  typeOfWSV = 'timeline';
} else if (currentDataset == 'eyetracking') {
  typeOfWSV = 'eyetracking';
}

var currentEntity = null;

var heightWordScaleVis = 20;
var numberOfEntities = 30;

var widthMarkLineChart = 6;
var widthMarkBarChart = 6;

// var numberOfMarks = 15;
var numberOfMarks = 31;

// var spaceBetweenGridCells = 4;

// default layout type is 'grid', no it should be null
var layoutType = null;

var dblClickLocation = {'x': 0, 'y': 0};

var goingBackAnimationRunning = false;

var tmpCurrentEntity;

// iconNames
// sorting
var lastDataValue_sort = 'order-by-lastDataValue';
var entityName_sort = 'order-by-entityName';
var docPosition_sort = 'order-by-docPosition';

// layout
var grid_layout = 'grid';
var column_layout = 'column';
var columnPanAligned_layout = 'column-pan-aligned';
var row_layout = 'row';
var gridNoOverlap_layout = 'grid-no-overlap';

// other interactions
var close_interaction = 'close';
var select_interaction = 'selector';
var unselect_interaction = 'selector-ok';

var study2 = 'exp2';

var previousLayout = grid_layout;

function setLayoutType(newLayout, layoutEvent) {
    layoutType = newLayout;

    if (layoutEvent !== 'giveUp') {
      previousLayout = newLayout;
    }

}

function isThereLayout() {
  return layoutType !== null
}

var typeOfDrag = 'inBetweenDrag';
// var typeOfDrag = 'swapDrag';

var measurementArray = [];

if (condition == 'interactive' || condition == study2 || condition == undefined) {

  // if there is a layout then flag should be true
  var layoutFlag = false;
  var visibleMenuItems = ['#grid', '#close', '#order-by-lastDataValue', '#order-by-entityName', '#order-by-docPosition'];
  var contextualMenuIcons = ['#grid', '#close', '#order-by-lastDataValue', '#order-by-entityName', '#order-by-docPosition'];//, '#order-by-entity-name-asc'];
  // var contextualMenuIcons = ['#grid', '#row', '#column', '#column-pan-aligned', '#grid-no-overlap', '#order-by-max', '#order-by-min'];//, '#order-by-entity-name-asc'];
  var nonLayoutIcons = ['#close', '#order-by-lastDataValue', '#order-by-entityName', '#order-by-docPosition', '#selector', '#selector-ok'];

  if (condition == study2) {
      visibleMenuItems = visibleMenuItems.concat(['#row', '#column', '#grid-no-overlap', '#selector', '#selector-ok']);
      contextualMenuIcons = contextualMenuIcons.concat(['#row', '#column', '#grid-no-overlap', '#selector', '#selector-ok']);
  }

  var noLastValueSOrt = ['eyetracking', 'timeline']
  if (noLastValueSOrt.includes(typeOfWSV)) {
    visibleMenuItems = ['#grid', '#close', '#order-by-entityName', '#order-by-docPosition', '#row', '#column', '#grid-no-overlap', '#selector', '#selector-ok'];
    contextualMenuIcons = ['#grid', '#close', '#order-by-entityName', '#order-by-docPosition', '#row', '#column', '#grid-no-overlap', '#selector', '#selector-ok'];
  }

  // flag to avoid mixing diff drag and brushing and linking
  var action = false;



  // use one array holding the cloned wsvs instead of two (above, below), it makes it way easier
  var WSV_cloned = [];
  var layoutInfo = {type: '', topLeftCorner_left: 0, topLeftCorner_top: 0, numberOfColumns: 0, cell_dimensions: {width: 0, height: 0}, spaceBetweenGridCells: 0, viewportLeft: 0, viewportRight: 0, viewportTop: 0, viewportBottom: 0};

  // set the space between grid cells
  layoutInfo.spaceBetweenGridCells = 4;


  createContextualMenu();
  addSuggestedInteractivityTags();


  getViewportMeasurements(condition);
}


// add entities, then generate the wsvs
// addEntitiesAtRandomPosition('#text', numberOfEntities);

// check if there is data for each entity if no data is available remove the entity tag
removeEntitiesWithNoData(currentDataset);

if (condition == 'interactive' || condition == study2 || condition == undefined) {
    addAttrAndEventsToEntities();

    addDraggingFunctionality();
}

addWSV(typeOfWSV, currentDataset);
// logStudyEvent('general text info', {'number of entities': $('.entity').length})

// DRAGGING
var dragged;
var dragStart_position = {x: 0, y: 0};
var dragEnd_position = {x: 0, y: 0};
var horizontalPoint_position = {x: 0, y: 0};
var draggedWSV_toReorder_position;


// colors
var entityFontColor_stored;
var sparklineColor_stored;


var orientationCirclesData = [];


$('#text').blast({ delimiter: "sentence", customClass: "sentence", generateIndexID: true });



// The keypress event is sent to an element when the browser registers keyboard input. This is similar to the keydown
// event, except that modifier and non-printing keys such as Shift, Esc, and delete trigger keydown events but not
// keypress events.
$(document).keydown(function(event) {

  if (event.keyCode == 27 || (event.charCode == 27)) {
    // ESC
    event.preventDefault();

    console.log("event: click (give up layout)");

    var tmpCurrentEntity = $(currentEntity)[0]

    if ($('#spacer').length > 0) {
      removeSpacer();
    }

    giveUpLayout();
    startMenuHideTimer();
    cleanupAfterLayout();
    clearSelection();
    // resetLayoutIcon();

    if (condition !== study2) {
      hideCloseIcon();
    }

    addUsabilityToMenu(tmpCurrentEntity);

    // logStudyEvent('gathering', {'interaction_type': 'giving up layout through ESC key'});
  }
});



// $('#text').dblclick(function(event) {
$('html').dblclick(function(event) {
  // console.log(event.target);

  // var listOfClasses = event.target.classList;
  var targetParentClasses = event.target.parentElement.classList;
  var tmpCurrentEntity = null;

  // console.log(targetParentClasses);

  if (condition === 'interactive' || condition === study2) {
    if ((($.inArray('entity', targetParentClasses) === -1) && ($.inArray('clonedWSV', targetParentClasses) === -1)) || ($.inArray('voronoi', targetParentClasses) === -1)) {

      if (isThereLayout()) {

        console.log("event: click (give up layout)");

        tmpCurrentEntity = $(currentEntity)[0]

        if ($('#spacer').length > 0) {
					removeSpacer();
				}

        giveUpLayout();
        startMenuHideTimer();
        cleanupAfterLayout();
        clearSelection();
        // resetLayoutIcon();

        if (condition !== study2) {
          hideCloseIcon();
        }

        addUsabilityToMenu(tmpCurrentEntity);

        // logStudyEvent('gathering', {'interaction_type': 'giving up layout through dbl_clicking'});

      } else {
        // summon grid layout when dblclicking somewhere on the canvas
        console.log("event: dblclick (create layout)")

        unSelectIcon();

        let iconName = grid_layout;
        if (condition === study2) {
          iconName = previousLayout;
        }

        // dblClickLocation.x = event.clientX;
        // dblClickLocation.y = event.clientY;
        dblClickLocation.x = event.pageX;
        dblClickLocation.y = event.pageY;

        changeLayout(iconName);

        layoutFlag = true;

        if (currentEntity !== null) {
          // currentEntity has to be set here by changeLayout, if not don't go on
          tmpCurrentEntity = $(currentEntity)[0]

          setLayoutType(iconName, 'newLayout');

          $('#' + iconName).addClass('currentSeletedLayout');
          console.log('layout set to "' + iconName + '"')


          add_SuggestedInteractivity();

          makeSelectable('sorting');
          makeNotSelectable('selection');

          showContextMenu(tmpCurrentEntity);
          // to make close icon appear
          hideLayoutIcon();

          // logStudyEvent('gathering', {'interaction_type': 'dbl_clicking to gather wsv in ' + iconName});
        } else {
          // logStudyEvent('gathering', {'interaction_type': 'dbl_clicking to gather wsv in ' + iconName, 'error': 'failed due to no visible entity'});
        }
      }

    } else {
      console.log('double clicked on the non-entity part of a wsv');
    }
  }
});


// from here http://stackoverflow.com/questions/880512/prevent-text-selection-after-double-click
function clearSelection() {
  if(document.selection && document.selection.empty) {
    document.selection.empty();
  } else if(window.getSelection) {
    var sel = window.getSelection();
    sel.removeAllRanges();
  }
}


// Utility method --- get query string args (https://stackoverflow.com/a/8649003)
function getQueryParams() {
  var query = location.search.substring(1);

  return JSON.parse(('{"' + decodeURI(query).replace(/"/g, '\\"')
    .replace(/&/g, '","').replace(/=/g,'":"') + '"}').replace('""',""));
}
