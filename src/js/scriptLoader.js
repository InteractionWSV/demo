
var scripts = [
  './src/lib/jquery.min.js',
  './src/lib/jquery-ui.min.js',
  './src/lib/jquery.sparklificator.js',
  './src/lib/renderers.js',
  './src/lib/d3.min.js',
  './src/lib/d3-array.min.js',
  './src/lib/jquery.color-2.1.2.min.js',
  './src/lib/lodash.min.js',
  './src/lib/datalib.min.js',
  './src/lib/velocity.min.js',
  './src/lib/velocity.ui.min.js',
  './src/lib/jquery.blast.min.js',
  './src/js/layout.js',
  './src/js/entitiesAndWSV.js',
  './src/js/measurements.js',
  './src/js/utilities.js',
  './src/js/contextualMenu.js',
  './src/data/wsvDataFile.js',
  './src/data/resultsHashTableString-VR.js',
  './src/data/stimuliString-VR.js',
  './src/data/aoisString-VR.js',
  './src/data/theStimuliSizes.js',
  './src/data/otherDataset.js',
  './src/js/initialPart.js'
];

var src;
var script;
var pendingScripts = [];
var firstScript = document.scripts[0];

// Watch scripts load in IE
function stateChange() {
  // Execute as many scripts in order as we can
  var pendingScript;
  while (pendingScripts[0] && pendingScripts[0].readyState == 'loaded') {
    pendingScript = pendingScripts.shift();
    // avoid future loading events from this script (eg, if src changes)
    pendingScript.onreadystatechange = null;
    // can't just appendChild, old IE bug if element isn't closed
    firstScript.parentNode.insertBefore(pendingScript, firstScript);
  }
}

// loop through our script urls
while (src = scripts.shift()) {
  if ('async' in firstScript) { // modern browsers
    script = document.createElement('script');
    script.async = false;
    script.src = src;
    document.head.appendChild(script);
  }
  else if (firstScript.readyState) { // IE<10
    // create a script and add it to our todo pile
    script = document.createElement('script');
    pendingScripts.push(script);
    // listen for state changes
    script.onreadystatechange = stateChange;
    // must set src AFTER adding onreadystatechange listener
    // else we’ll miss the loaded event for cached scripts
    script.src = src;
  }
  else { // fall back to defer
    document.write('<script src="' + src + '" defer></'+'script>');
  }
}
