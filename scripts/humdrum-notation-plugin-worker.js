//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec  2 08:11:05 EST 2018
// Last Modified: Sun Dec 23 01:58:26 EST 2018
// Filename:      humdrum-notation-plugin.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
//	This script sets up an editiable humdrum text region
//	on a webpage plus a dynamcially calculated SVG image
//	generated from the humdrum text using verovio.
//
//	Input parameters for plugin styling:
//		tabsize:            default none (browser default)
//		humdrumMinHeight: the minimum height of the humdrum text box
//		humdrumMaxWidth:  the maximum width of the humdrum text box
//		humdrumMinWidth:  the maximum width of the humdrum text box
//		humdrumVisible:    "false" will hide the humdrum text.
//		callback:           callback when notation changes
//
//	Parameters for verovio:
//	http://www.verovio.org/command-line.xhtml
//
//		adjustPageHeight default 1
//		border           default 50
//		evenNoteSpacing  default 0
//		font             default "Leipzig"
//		format           default "auto"
//		# page           default 1
//		# header         default 0
//		# footer         default 0
//		pageHeight       default 60000
//		pageWidth        default 1350
//		scale            default 40
//		spacingLinear    default 0.25
//		spacingNonLinear default 0.6
//		spacingStaff     default 3
//		spacingSystem    default 6
//

//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/global.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// This file contains global functions for the Humdrum notation plugin.
//



//////////////////////////////
//
// DOMContentLoaded event listener --
//

document.addEventListener("DOMContentLoaded", function() {
	downloadVerovioToolkit("true");
});



//////////////////////////////
//
// downloadVerovioToolkit --
//

function downloadVerovioToolkit(use_worker) {
   vrvWorker = new vrvInterface(use_worker, callbackAfterInitialized);
};

function callbackAfterInitialized() {
	console.log("Initialized verovio worker");
	HNP.ready = 1;
	HNP.displayWaiting();
}




//////////////////////////////
//
// setErrorScore --
//

function setErrorScore(baseid) {
	document.addEventListener("DOMContentLoaded", function() {
		HNP.setErrorScore(baseid);
	});
}



//////////////////////////////
//
// setHumdrumOption --
//

function setHumdrumOption(baseid, key, value) {
	if (typeof baseid  !== "string" && !(baseid instanceof String)) {
		console.log("Error: ID must be a string, but is", baseid, "which is a", typeof baseid);
		return;
	}
	if (typeof key  !== "string" && !(key instanceof String)) {
		console.log("Error: property must be a string, but is", key, "which is a", typeof baseid);
		return;
	}
	var entry = HNP.entries[baseid];
	if (!entry) {
		console.log("Error: ID does not reference a Humdrum notation script:", baseid);
		return;
	}
	if (!entry.options) {
		console.log("Error: entry", baseid, "does not have any options to change.");
		return;
	}
	entry.options[key] = value;
}



//////////////////////////////
//
// getHumdrumOption --
//

function getHumdrumOption(baseid, key) {
	if (typeof baseid  !== "string" && !(baseid instanceof String)) {
		console.log("Error: ID must be a string, but is", baseid, "which is a", typeof baseid);
		return;
	}
	if (typeof key  !== "string" && !(key instanceof String)) {
		console.log("Error: property must be a string, but is", key, "which is a", typeof baseid);
		return;
	}
	var entry = HNP.entries[baseid];
	if (!entry) {
		console.log("Error: ID does not reference a Humdrum notation script:", baseid);
		return;
	}
	if (!entry.options) {
		console.log("Error: entry", baseid, "does not have any options to change.");
		return;
	}
	return entry.options[key];
}



//////////////////////////////
//
// displayHumdrum -- Main externally usable function which sets up
//   a Humdrum notation display on a webpage (if it does not exist), and then
//   creates an SVG image for the notation.
//

function displayHumdrum(opts) {
	
	if (HNP.ready) {
	
     	HNP.displayHumdrumNow(opts);
	} else {
		// Wait until the page has finished loading resources.
		HNP.waiting.push(opts);
		// document.addEventListener("DOMContentLoaded", function() {
		// 	HNP.displayHumdrumNow(opts);
		// });
	}
}





///////////////////////////////
//
// downloadHumdrumUrlData -- Download Humdrum data from a URL and then convert
//     the data into an SVG.
//

function downloadHumdrumUrlData(source, opts) {
	if (!source) {
		return;
	}
	if (!opts.processedUrl) {
		return;
	}
	if (opts.processedUrl.match(/^\s*$/)) {
		return;
	}
	var url = opts.processedUrl;
	var fallback = opts.urlFallback;
	var request = new XMLHttpRequest();

	request.addEventListener("load", function() {
		source.textContent = this.responseText;
		HNP.displayHumdrumNow(opts);
	});
	request.addEventListener("error", function() {
		downloadFallback(source, opts, fallback);
	});
	request.addEventListener("loadstart", function() {
		// display a busy cursor
		document.body.style.cursor = "wait !important";
	});
	request.addEventListener("loadend", function() {
		// display a normal cursor
		document.body.style.cursor = "auto";
	});
	request.open("GET", url);
	request.send();

}



//////////////////////////////
//
// downloadFallback -- Load alternate URL for data. Use embedded data if there is a problem.
//

function downloadFallback(source, opts, url) {
	if (!url) {
		HNP.displayHumdrumNow(opts);
	}

	var request = new XMLHttpRequest();
	request.onload = function() {
		if (this.status == 200) {
			source.textContent = this.responseText;
			HNP.displayHumdrumNow(opts);
		} else {
			HNP.displayHumdrumNow(opts);
		}
	};
	request.onerror = function() {
		HNP.displayHumdrumNow(opts);
	};
	request.open("GET", url);
	request.send();
}



//////////////////////////////
//
// checkParentResize --
//    Note that Safari does not allow shrinking of original element sizes, only 
//    expanding: https://css-tricks.com/almanac/properties/r/resize
//

function checkParentResize(baseid) {
	var entry = HNP.entries[baseid];
	if (!entry) {
		console.log("Error: cannot find data for ID", baseid);
		return;
	}
	var container = entry.container;
	if (!container) {
		console.log("Error: cannot find container for ID", baseid);
		return;
	}
	var pluginOptions = entry.options;
	if (!pluginOptions) {
		console.log("Error: cannot find options for ID", baseid);
		return;
	}
	var scale = pluginOptions.scale;
	var previousWidth = parseInt(pluginOptions._currentPageWidth * scale / 100.0);
	var style = window.getComputedStyle(container, null);
	var currentWidth = parseInt(style.getPropertyValue("width"));
	if (currentWidth == previousWidth) {
		// nothing to do
		return;
	}
	if (Math.abs(currentWidth - previousWidth) < 3)  {
		// Safari required hysteresis
		return;
	}
	// console.log("UPDATING NOTATION DUE TO PARENT RESIZE FOR", baseid);
	// console.log("OLDWIDTH", previousWidth, "NEWWIDTH", currentWidth);
	if (!HNP.MUTEX) {
		// This code is used to stagger redrawing of the updated examples
		// so that they do not all draw at the same time (given a little
		// more responsiveness to the UI).
		HNP.MUTEX = 1;
		displayHumdrum(baseid);
		HNP.MUTEX = 0;
	}
}



//////////////////////////////
//
// convertMusicXmlToHumdrum --
//


function convertMusicXmlToHumdrum(targetElement, sourcetext, vrvOptions, pluginOptions) {
	// var toolkit = pluginOptions.renderer;
	if (typeof vrvWorker !== "undefined") {
		toolkit = vrvWorker;
	}

	if (!toolkit) {
		console.log("Error: Cannot find verovio toolkit!");
		return;
	}
	// from = input data type
	vrvOptions.from = "musicxml-hum";


	vrvWorker.filterData(vrvOptions, sourcetext, "humdrum")
	.then(function(content) {
		targetElement.textContent = content;
		targetElement.style.display = "block";
	});

}



//////////////////////////////
//
// getHumdrum -- Return the Humdrum data used to render the last
//    SVG image(s).  This Humdrum data is the potentially
//    filtered input Humdrum data (otherwise the last raw
//    Humdrum input data).
//


function getHumdrum(pluginOptions) {
	var toolkit = pluginOptions.renderer;
	if (typeof vrvWorker !== "undefined") {
		toolkit = vrvWorker;
	}


	if (!toolkit) {
		console.log("Error: Cannot find verovio toolkit!");
		return;
	}


	vrvWorker.getHumdrum()
	.then(function(content) {
		return content;
	});

}



//////////////////////////////
//
// convertMeiToHumdrum --
//


function convertMeiToHumdrum(targetElement, sourcetext, vrvOptions, pluginOptions) {
	var toolkit = pluginOptions.renderer;
	if (typeof vrvWorker !== "undefined") {
		toolkit = vrvWorker;
	}


	if (!toolkit) {
		console.log("Error: Cannot find verovio toolkit!");
		return;
	}
	// from = input data type
	vrvOptions.from = "mei-hum";


	vrvWorker.filterData(vrvOptions, sourcetext, "humdrum")
	.then(function(content) {
		targetElement.textContent = content;
		targetElement.style.display = "block";
	});

}



//////////////////////////////
//
// getFilters -- Extract filters from the options and format for insertion
//    onto the end of the Humdrum data inpt to verovio.
//

function getFilters(options) {
	var filters = options.filter;
	if (!filters) {
		filters = options.filters;
	}
	if (!filters) {
		return "";
	}
	if (Object.prototype.toString.call(filters) === "[object String]") {
		filters = [filters];
	} else if (!Array.isArray(filters)) {
		// expected to be a string or array, so giving up
		return "";
	}
	var output = "";
	for (var i=0; i<filters.length; i++) {
		output += "!!!filter: " + filters[i] + "\n";
	}

	return output;
}



//////////////////////////////
//
// executeFunctionByName -- Also allow variable names that store functions.
//

function executeFunctionByName(functionName, context /*, args */) {
	if (typeof functionName === "function") {
		return
	}
	var args = Array.prototype.slice.call(arguments, 2);
	var namespaces = functionName.split(".");
	var func = namespaces.pop();
	for (var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
		if (context && context[func]) {
			break;
		}
	}
	return context[func].apply(context, args);
}



//////////////////////////////
//
// functionName --
//

function functionName(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}





//////////////////////////////
//
// saveHumdrumSvg -- Save the specified Hudrum SVG images to the hard disk.  The input
// can be any of:
//    * A Humdrum script ID
//    * An array of Humdrum script IDs
//    * Empty (in which case all images will be saved)
//    * An SVG element
//

function saveHumdrumSvg(tags, savename) {
	if ((tags instanceof Element) && (tags.nodeName === "svg")) {
		// Save a single SVG element's contents to the hard disk.
		var sid = "";
		sid = tags.id;
		if (!sid) {
			sid = tags.parentNode.id;
		}
		var filename = savename;
		if (!filename) {
			filename = sid.replace(/-svg$/, "") + ".svg";
		}
		var text = tags.outerHTML.replace(/&nbsp;/g, " ").replace(/&#160;/g, " ");;
		blob = new Blob([text], { type: 'image/svg+xml' }),
		anchor = document.createElement('a');
		anchor.download = filename;
		anchor.href = window.URL.createObjectURL(blob);
		anchor.dataset.downloadurl = ['image/svg+xml', anchor.download, anchor.href].join(':');
		(function (anch, blobby, fn) {
			setTimeout(function() {
				anch.click();
				window.URL.revokeObjectURL(anch.href);
      		blobby = null;
			}, 0)
		})(anchor, blob, filename);
		return;
	}

	var i;
	if (!tags) {
		// var selector = 'script[type="text/x-humdrum"]';
		var selector = '.humdrum-text[id$="-humdrum"]';
		var items = document.querySelectorAll(selector);
		tags = [];
		for (i=0; i<items.length; i++) {
			var id = items[i].id.replace(/-humdrum$/, "");
			if (!id) {
				continue;
			}
			var ss = "#" + id + "-svg svg";
			var item = document.querySelector(ss);
			if (item) {
				tags.push(item);
			}
		}
	}
	if (tags.constructor !== Array) {
		tags = [tags];
	}

	(function (i, sname) {
		(function j () {
			var tag = tags[i++];
			if (typeof tag  === "string" || tag instanceof String) {
				var s = tag
				if (!tag.match(/-svg$/)) {
					s += "-svg";
				}
				var thing = document.querySelector("#" + s + " svg");
				if (thing) {
					saveHumdrumSvg(thing, sname);
				}
			} else if (tag instanceof Element) {
				(function(elem) {
					saveHumdrumSvg(elem, sname);
				})(tag);
			}
			if (i < tags.length) {
				// 100 ms delay time is necessary for saving all SVG images to
				// files on the hard disk.  If the time is too small, then some
				// of the files will not be saved.  This could be relate to
				// deleting the temporary <a> element that is used to download
				// the file.  100 ms is allowing 250 small SVG images to all
				// be saved correctly (may need to increase for larger files, or
				// perhaps it is possible to lower the wait time between image
				// saves).  Also this timeout (even if 0) will allow better
				// conrol of the UI vesus the file saving.
				setTimeout(j, 100);
			}
		})();
	})(0, savename);
}



//////////////////////////////
//
// saveHumdrumText -- Save the specified Hudrum text to the hard disk.  The input
// can be any of:
//    * A Humdrum script ID
//    * An array of Humdrum script IDs
//    * Empty (in which case all Humdrum texts will be saved)
//    * If the third parameter is present, then the first parameter will be ignored
//      and the text content of the third parameter will be stored in the filename
//      of the second parameter (with a default of "humdrum.txt").
//

function saveHumdrumText(tags, savename, savetext) {

	if (savetext) {
		// Saving literal text content to a file.
		if (!savename) {
			savename = "humdrum.txt";
		}
		// Unescaping < and >, which may cause problems in certain conditions, but not many:
		var stext = savetext.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		blob = new Blob([stext], { type: 'text/plain' }),
		anchor = document.createElement('a');
		anchor.download = savename;
		anchor.href = window.URL.createObjectURL(blob);
		anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
		(function (anch, blobby) {
			setTimeout(function() {
				anch.click();
				window.URL.revokeObjectURL(anch.href);
      		blobby = null;
			}, 0)
		})(anchor, blob);
		return;
	}

	if ((tags instanceof Element) && (tags.className.match(/humdrum-text/))) {
		// Save the text from a single element.
		var sid = "";
		sid = tags.id;
		if (!sid) {
			sid = tags.parentNode.id;
		}
		var filename = savename;
		if (!filename) {
			filename = sid.replace(/-humdrum$/, "") + ".txt";
		}
		var text = tags.textContent.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		blob = new Blob([text], { type: 'text/plain' }),
		anchor = document.createElement('a');
		anchor.download = filename;
		anchor.href = window.URL.createObjectURL(blob);
		anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
		anchor.click();
		window.URL.revokeObjectURL(anchor.href);
      blob = null;
		return;
	}

	if (typeof tags  === "string" || tags instanceof String) {
		// Convert a Humdrum ID into an element and save contents in that element.
		var myid = tags.replace(/-humdrum$/, "");
		var myelement = document.querySelector("#" + myid + "-humdrum");
		if (!myelement) {
			myelement = document.querySelector("#" + myid);
		}
		saveHumdrumText(myelement);
		return;
	}

	if (!tags) {
		// If tags is empty, then create a list of all elements that
		// should contain Humdrum content.
		var selector = '.humdrum-text[id$="-humdrum"]';
		tags = document.querySelectorAll(selector);
	}
	if (tags.constructor !== NodeList) {
		if (tags.constructor !== Array) {
			// Force tags to be in an array-like structure (not that necessary).
			tags = [tags];
		}
	}
	if (tags.length == 0) {
		// Nothing to do, so give up.
		return;
	}
	if (tags.length == 1) {
		// Just one element on the page with interesting content, so save that
		// to a filename based on the element ID.
		saveHumdrumText(tags[0]);
		return;
	}

	// At this point, there are multiple elements with Humdrum content that should
	// be saved to the hard-disk.  Combine all of the content into a single data
	// stream, and then save (with a default filename of "humdrum.txt").

	var i;
	var outputtext = "";
	var humtext = "";
	for (i=0; i<tags.length; i++) {
		if (!tags[i]) {
			continue;
		}
		if (typeof tags[i]  === "string" || tags[i] instanceof String) {
			saveHumdrumText(tags[i]);
			// convert a tag to an element:
			var s = tags[i];
			if (!tags[i].match(/-humdrum$/)) {
				s += "-humdrum";
			}
			var thing = document.querySelector("#" + s);
			if (thing) {
				tags[i] = thing;
			} else {
				continue;
			}
		}
		// Collect the Humdrum file text of the element.
		if (tags[i] instanceof Element) {
			var segmentname = tags[i].id.replace(/-humdrum$/, "");
			if (!segmentname.match(/\.[.]*$/)) {
				segmentname += ".krn";
			}
			humtext = tags[i].textContent.trim()
					// remove any pre-existing SEGMENT marker:
					.replace(/^!!!!SEGMENT\s*:[^\n]*\n/m, "");
			if (humtext.match(/^\s*$/)) {
				// Ignore empty elements.
				continue;
			}
			outputtext += "!!!!SEGMENT: " + segmentname + "\n";
			outputtext += humtext + "\n";
		}
	}
	// save all extracted Humdrum content in a single file:
	saveHumdrumText(null, null, outputtext);
}



//////////////////////////////
//
// cloneObject -- Make a deep copy of an object, preserving arrays.
//

function cloneObject(obj) {
	var output, v, key;
	output = Array.isArray(obj) ? [] : {};
	for (key in obj) {
		v = obj[key];
		if (v instanceof HTMLElement) {
			continue;
		}
		output[key] = (typeof v === "object") ? cloneObject(v) : v;
	}
	return output;
}





//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/HumdrumNotationPluginEntry.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// This file contains the HumdrumNotationPluginEntry class for 
// the Humdrum notation plugin.  This class is the used to store 
// options and elements for each notation example on a webpage.
//


//////////////////////////////
//
// HumdrumNotationPluginEntry::initializer --
//

function HumdrumNotationPluginEntry(baseid, opts) {
	this.baseId = baseid;
	if (opts instanceof Object) {
		this.options = cloneObject(opts);
	} else {
		this.options   = {};   // storage for options (both HNP and Verovio);
	}

	// Primary HTML elements related to entry:
	this.container = null; // container element for notation
	this.humdrum   = null; // storage for Humdrum data
	this.svg       = null; // storage for SVG image
	this.humdrumOutput = null; // storage for Humdrum after filtering to create SVG image
	this.pages     = [];   // storage buffer for SVG of each page (multi-page examples)

	return this;
}



//////////////////////////////
//
// HumdrumNotationPluginEntry::convertFunctionNamesToRealFunctions --
//

HumdrumNotationPluginEntry.prototype.convertFunctionNamesToRealFunctions = function () {
	if (!this.options) {
		console.log("Error: options not defined in entry:", this);
		return;
	}
	if (this.options.postFunction) {
		if (typeof this.options.postFunction === "string") {
			if ({}.toString.call(this.options.postFunction) === '[object Function]') {
				this.options.postFunction = functionName(this.options.postFunction);
			}
		}
	}
}



//////////////////////////////
//
// HumdruNotationPluginEntry::createContainer -- Create a target location
//     for the Humdrum notation content.  First check if there is an element
//     with the given ID, and return that element if it exists.  If it does not
//     exist, then create a div element with the given containerid used as the
//     ID for the div.

HumdrumNotationPluginEntry.prototype.createContainer = function () {
	if (this.container) {
		console.log("Error: container already initialize:", this.container);
	}
	var container = document.querySelector("#" + this.baseId + "-container");
	if (container) {
		// Recycle this container for use with the plugin.  Typically the
		// container is predefined to reserve vertical space for the notation
		// that will be placed inside of it.
		this.container = container;
	} else {
		// the container needs to be created, and it will be placed
		// just above the source script.

		var target = document.querySelector("#" + this.baseId);
		if (!target) {
			console.log("Error: need a target to place container before:", this.baseId);
			return null;
		}
		this.container = document.createElement('div');
		this.container.id = this.baseId + "-container";
		target.parentNode.insertBefore(this.container, target);
	}
	this.container.className = "humdrum-notation-plugin";
	return this.container;
};



//////////////////////////////
//
// HumdrumNotationPluginEntry::copyContentToContainer --
//

HumdrumNotationPluginEntry.prototype.copyContentToContainer = function () {
	if (!this.options) {
		console.log("Error: options required for entry:", this);
		return;
	}
	if (!this.options.source) {
		console.log("Error: Source property required for options:", this.options);
		return;
	}
	
	if (!this.humdrum) {
		console.log("Error: Humdrum container target not initialized:", this);
		return;
	}
	

	var source = document.querySelector("#" + this.options.source);

	if (!source) {
		console.log("Error: No Humdrum source for", this.baseId);
		
		console.log("ID that is empty:", this.options.source);
		
		return;
	}
	if (!this.container) {
		console.log("Error: No container for storing data from ID", this.baseId);
		return;
	}
	var content = source.textContent.trim();

	var initial = content.substr(0, 600);
	// Probably use the real plugin options here later:
	var poptions = {};
	var options;
	if (initial.match(/^\s*</)) {
		// some sort of XML junk, so convert to Humdrum
		var ctype = "unknown";
		if (initial.match(/<mei /)) {
			ctype = "mei";
		} else if (initial.match(/<mei>/)) {
			ctype = "mei";
		} else if (initial.match(/<music>/)) {
			ctype = "mei";
		} else if (initial.match(/<music /)) {
			ctype = "mei";
		} else if (initial.match(/<pages>/)) {
			ctype = "mei";
		} else if (initial.match(/<pages /)) {
			ctype = "mei";
		} else if (initial.match(/<score-partwise>/)) {
			ctype = "musicxml";
		} else if (initial.match(/<score-timewise>/)) {
			ctype = "musicxml";
		} else if (initial.match(/<opus>/)) {
			ctype = "musicxml";
		} else if (initial.match(/<score-partwise /)) {
			ctype = "musicxml";
		} else if (initial.match(/<score-timewise /)) {
			ctype = "musicxml";
		} else if (initial.match(/<opus /)) {
			ctype = "musicxml";
		}
		if (ctype === "musicxml") {
			// convert MusicXML data into Humdrum data
			options = {
				format: "musicxml-hum"
			};
			
			convertMusicXmlToHumdrum(this.humdrum, content, options, poptions);
			
		} else if (ctype === "mei") {
			// convert MEI data into Humdrum data
			options = {
				format: "mei-hum"
			};
			
			convertMeiToHumdrum(this.humdrum, content, options, poptions);
			
		} else {
			console.log("Warning: given some strange XML data:", content);
		}
	
	} else {
		this.humdrum.textContent = content;
	}
	
}



//////////////////////////////
//
// HumdrumNotationPluginEntry::initializeContainer --  Generate contents for
//      the main humdrum-plugin div that is used to hold the verovio options,
//      the input humdrum text and the output verovio SVG image.
//
// The main container is a div element with an ID that matches the ID of the
// source Humdrum data script followed by an optional variant tag and then
// the string "-container".
//
// Inside the main target div there are two elements of interest:
//    (1) a div element with an similar ID that ends in "-options" rather
//        than "-container".
//    (2) a table element that contains the potentially visible Humdrum text
//        that create the SVG image in one cell, and another cell that contains
//        the SVG rendering of the Humdrum data.
//
//        The Humdrum data is stored within a pre element (may be changed later)
//        that has an ID in the form of the container div, but with "-humdrum" as
//        the extension for the ID.
//
//        The SVG image is stored in a div that has an ID that is similar to the
//        containing element, but has "-svg" as an extension rather than "-container".
//
// How the humdrum and svg containers are stored in the table will be dependend on how
// the layout of the two elements are set, with the Humdrum data either above, below,
// to the left or two the right of the SVG image.
//
// So a typical organization of the resulting code from this function might be:
//
// <div class="humdrum-plugin" id="bach-container">
//    <div id="bach-options">[Options for rendering with verovio]</div>
//    <table class="humdrum-verovio">
//       <tbody>
//       <tr>
//          <td>
//          <div>
//             <script type="text/x-humdrum" class="humdrum-notation-plugin" id="bach-humdrum">[Humdrum contents]</text>
//          </div>
//          </td>
//          <td>
//             <div class="verovio-svg" id="bach-svg">[SVG image of music notation]</div>
//          </td>
//       </tr>
//       </tbody>
//    </table>
// </div>
//
// Also notice the class names which can be used for styling the notation or humdrum text:
//    humdrum-plugin  == The main div container for the musical example.
//    humdrum-verovio == The class name of the table that contains the humdrum and rendered svg.
//    humdrum-text    == The potentially visible Humdrum text for the example.
//    verovio-svg     == The div container that holes the verovio-generated SVG image.
//

HumdrumNotationPluginEntry.prototype.initializeContainer = function () {
	if (!this.container) {
		console.log("Error: Container must first be created:", this);
		return;
	}

	var output = "";
	var hvisible = false;
	if ((this.options["humdrumVisible"] === "true") || 
	    (this.options["humdrumVisible"] === true) || 
	    (this.options["humdrumVisible"] === 1)) {
		hvisible = true;
	}

	output += "<table class='humdrum-verovio'";
	output += " style='border:0; border-collapse:collapse;'";
	output += ">\n";
	output += "   <tbody>\n";
	output += "   <tr style='border:0' valign='top'>\n";
	if (hvisible) {
		output += "<td";
		if (this.options["humdrumMinWidth"]) {
			output += " style='border:0; min-width: " + this.options["humdrumMinWidth"] + ";'";
		} else {
			output += " style='border:0;'";
		}
		output += ">\n";
	} else {
		output += "<td style='border:0; display:none;'>\n";
	}

	output += "<div>\n";
	output += "<script type='text/x-humdrum' style='display:none;' class='humdrum-text'";
	output += " contenteditable='true' id='";
	output += this.baseId + "-humdrum'></script>\n";
	output += "</div>\n";
	output += "</td>\n";

	output += "<td style='border:0;'>\n";
	output += "<div class='verovio-svg'";
	output += " id='" + this.baseId + "-svg'></div>\n";
	output += "</td>\n";
	output += "</tr>\n";
	output += "</tbody>\n";
	output += "</table>\n";

	var oldcontent = this.container.innerHTML;
	this.container.innerHTML = output;

	this.humdrum = this.container.querySelector("#" + this.baseId + "-humdrum");
	this.svg = this.container.querySelector("#" + this.baseId + "-svg");
	// Move any previous content to the svg container.  This may contain
	// a pre-image that needs to be preserved a little longer so that the
	// final SVG image can be calculated.
	this.svg.innerHTML = oldcontent;
}



//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/HumdrumNotationPluginDatabase.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// This file contains the HumdrumNotationPluginDatabase class for
// the Humdrum notation plugin.  This class is the main database for
// keeping track of options and locations of examples on a webpage.
//


//////////////////////////////
//
// HumdrumNotationPluginDatabase::prepareOptions --
//

HumdrumNotationPluginDatabase.prototype.prepareOptions = function () {
	var list = this.verovioOptions.OPTION;
	for (var i=0; i<list.length; i++) {
		if (list[i].CLI_ONLY) {
			continue;
		}
		this.verovioOptions[list[i].NAME] = list[i];
	}
};



HumdrumNotationPluginDatabase.prototype.verovioOptions = {
   "OPTION": [
      {
         "NAME": "help",
         "ABBR": "?",
         "INFO": "Display help message",
         "ARG": "none",
         "CLI_ONLY": "true"
      },
      {
         "NAME": "allPages",
         "ABBR": "a",
         "INFO": "Output all pages",
         "ARG": "none",
         "CLI_ONLY": "true?"
      },
      {
         "NAME": "from",
         "NAME_CLI": "from",
         "ABBR": "f",
         "INFO": "Select input data from",
         "ARG": "string",
         "DEF": "mei",
         "ALT": [
            "auto",
            "darms",
            "pae",
            "xml",
            "humdrum",
            "humdrum-xml"
         ],
         "CLI_ONLY": "true?"
      },
      {
         "NAME": "outfile",
         "ABBR": "o",
         "INFO": "Output file name (use \"-\" for standard output)",
         "ARG": "string",
         "CLI_ONLY": "true"
      },
      {
         "NAME": "page",
         "ABBR": "p",
         "INFO": "Select the page to engrave",
         "ARG": "integer",
         "DEF": "1",
         "MIN": "1",
         "CLI_ONLY": "true"
      },
      {
         "NAME": "resources",
         "ABBR": "r",
         "INFO": "Path to SVG resources",
         "ARG": "string",
         "DEF": "/usr/local/share/verovio",
         "CLI_ONLY": "true"
      },
      {
         "NAME": "scale",
         "ABBR": "s",
         "INFO": "Scale percent",
         "ARG": "integer",
         "DEF": "100",
         "MIN": "1"
      },
      {
         "NAME": "minLastJustification",
         "INFO": "Minimum length of last system which can be stretched to 100% width of page.",
         "ARG": "float",
         "DEF": "0.8",
         "MIN": "0.0",
         "MAX": "1.0"
      },
      {
         "NAME": "to",
         "ABBR": "t",
         "INFO": "Select output data format",
         "ARG": "string",
         "DEF": "svg",
         "ALT": [
            "mei",
            "midi"
         ]
      },
      {
         "NAME": "version",
         "ABBR": "v",
         "INFO": "Display the version number",
         "ARG": "none",
         "CLI_ONLY": "true"
      },
      {
         "NAME": "xmlIdSeed",
         "ABBR": "x",
         "INFO": "See the random number generator for XML IDs",
         "ARG": "integer"
      },
      {
         "NAME": "adjustPageHeight",
         "CAT": "input and page layout options",
         "INFO": "Crop the page height to the height of the content",
         "ARG": "none"
      },
      {
         "NAME": "breaks",
         "CAT": "input and page layout options",
         "INFO": "Define page and system breaks layout",
         "ARG": "string",
         "DEF": "auto",
         "ALT": "encoded"
      },
      {
         "NAME": "evenNoteSpacing",
         "CAT": "input and page layout options",
         "INFO": "Specify the linear spacing factor",
         "ARG": "none"
      },
      {
         "NAME": "humType",
         "CAT": "input and page layout options",
         "INFO": "Include type attributes when importing from Humdrum",
         "ARG": "none"
      },
      {
         "NAME": "landscape",
         "CAT": "input and page layout options",
         "INFO": "The landscape paper orientation flag",
         "ARG": "none"
      },
      {
         "NAME": "mensuralToMeasure",
         "CAT": "input and page layout options",
         "INFO": "Convert mensural sections to measure-based MEI",
         "ARG": "none"
      },
      {
         "NAME": "mmOutput",
         "CAT": "input and page layout options",
         "INFO": "Specify that the output in the SVG is given in mm (default is px)",
         "ARG": "none"
      },
      {
         "NAME": "footer",
         "CAT": "input and page layout options",
         "INFO": "Do not add any footer, add a footer, use automatic footer",
         "ARG": "string",
         "DEF": "auto",
         "ALT": "encoded",
         "ALT": "none"
      },
      {
         "NAME": "header",
         "CAT": "input and page layout options",
         "INFO": "Do not add any header, add a header, use automatic header",
         "ARG": "string",
         "DEF": "auto",
         "ALT": "encoded",
         "ALT": "none"
      },
      {
         "NAME": "noJustification",
         "CAT": "input and page layout options",
         "INFO": "Do not justify the system",
         "ARG": "none"
      },
      {
         "NAME": "pageHeight",
         "CAT": "input and page layout options",
         "INFO": "The page height",
         "ARG": "integer",
         "DEF": "2970",
         "MIN": "100",
         "MAX": "60000"
      },
      {
         "NAME": "pageMarginBottom",
         "CAT": "input and page layout options",
         "INFO": "The page bottom margin",
         "ARG": "integer",
         "DEF": "50",
         "MIN": "0",
         "MAX": "500"
      },
      {
         "NAME": "pageMarginLeft",
         "CAT": "input and page layout options",
         "INFO": "The page left margin",
         "ARG": "integer",
         "DEF": "50",
         "MIN": "0",
         "MAX": "500"
      },
      {
         "NAME": "pageMarginRight",
         "CAT": "input and page layout options",
         "INFO": "The page right margin",
         "ARG": "integer",
         "DEF": "50",
         "MIN": "0",
         "MAX": "500"
      },
      {
         "NAME": "pageMarginTop",
         "CAT": "input and page layout options",
         "INFO": "The page top margin",
         "ARG": "integer",
         "DEF": "50",
         "MIN": "0",
         "MAX": "500"
      },
      {
         "NAME": "pageWidth",
         "CAT": "input and page layout options",
         "INFO": "The page width",
         "ARG": "integer",
         "DEF": "2100",
         "MIN": "100",
         "MAX": "60000"
      },
      {
         "NAME": "unit",
         "CAT": "input and page layout options",
         "INFO": "The MEI unit (1/2 of the distance between the staff lines)",
         "ARG": "integer",
         "DEF": "9",
         "MIN": "6",
         "MAX": "20"
      },
      {
         "NAME": "barLineWidth",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The width of a barline in MEI units",
         "DEF": "0.30",
         "MIN": "0.10",
         "MAX": "0.80"
      },
      {
         "NAME": "beamMaxSlope",
         "ARG": "integer",
         "INFO": "The maximum beam slope",
         "CAT": "general layout",
         "DEF": "10",
         "MIN": "1",
         "MAX": "20"
      },
      {
         "NAME": "beamMinSlope",
         "ARG": "integer",
         "INFO": "The minimum beam slope",
         "CAT": "general layout",
         "DEF": "0",
         "MIN": "0",
         "MAX": "0"
      },
      {
         "NAME": "font",
         "ARG": "string",
         "INFO": "Set the music font",
         "CAT": "general layout",
         "DEF": "Leipzig"
      },
      {
         "NAME": "graceFactor",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The grace size ratio numerator",
         "DEF": "0.75",
         "MIN": "0.50",
         "MAX": "1.00"
      },
      {
         "NAME": "graceRhythmAlign",
         "ARG": "none",
         "INFO": "Align grace notes rhythmically with all staves",
         "CAT": "general layout"
      },
      {
         "NAME": "graceRightAlign",
         "ARG": "none",
         "INFO": "Align the right position of a grace group with all staves",
         "CAT": "general layout"
      },
      {
         "NAME": "hairpinSize",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The haripin size in MEI units",
         "DEF": "3.00",
         "MIN": "1.00",
         "MAX": "8.00"
      },
      {
         "NAME": "lyricSize",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The lyrics size in MEI units",
         "DEF": "4.50",
         "MIN": "2.00",
         "MAX": "8.00"
      },
      {
         "NAME": "lyricTopMinMargin",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The minmal margin above the lyrics in MEI units",
         "DEF": "3.00",
         "MIN": "3.00",
         "MAX": "8.00"
      },
      {
         "NAME": "minMeasureWidth",
         "ARG": "integer",
         "INFO": "The minimal measure width in MEI units",
         "CAT": "general layout",
         "DEF": "15",
         "MIN": "1",
         "MAX": "30"
      },
      {
         "NAME": "measureNumber",
         "ARG": "string",
         "INFO": "The measure numbering rule (unused)",
         "CAT": "general layout",
         "DEF": "system",
         "ALT": "interval"
      },
      {
         "NAME": "slurControlPoints",
         "ARG": "integer",
         "INFO": "Slur control points - higher value means more curved at the end",
         "CAT": "general layout",
         "DEF": "5",
         "MIN": "1",
         "MAX": "10"
      },
      {
         "NAME": "slurCurveFactor",
         "ARG": "integer",
         "INFO": "Slur curve factor - high value means rounder slurs",
         "CAT": "general layout",
         "DEF": "10",
         "MIN": "1",
         "MAX": "100"
      },
      {
         "NAME": "slurHeightFactor",
         "ARG": "integer",
         "INFO": "Slur height factor -  high value means flatter slurs",
         "CAT": "general layout",
         "DEF": "5",
         "MIN": "1",
         "MAX": "100"
      },
      {
         "NAME": "slurMinHeight",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The minimum slur height in MEI units",
         "DEF": "1.20",
         "MIN": "0.30",
         "MAX": "2.00"
      },
      {
         "NAME": "slurMaxHeight",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The maximum slur height in MEI units",
         "DEF": "3.00",
         "MIN": "2.00",
         "MAX": "6.00"
      },
      {
         "NAME": "slurMaxSlope",
         "ARG": "integer",
         "INFO": "The maximum slur slope in degrees",
         "CAT": "general layout",
         "DEF": "20",
         "MIN": "0",
         "MAX": "45"
      },
      {
         "NAME": "slurThickness",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The slur thickness in MEI units",
         "DEF": "0.60",
         "MIN": "0.20",
         "MAX": "1.20"
      },
      {
         "NAME": "spacingLinear",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "Specify the linear spacing factor",
         "DEF": "0.25",
         "MIN": "0.00",
         "MAX": "1.00"
      },
      {
         "NAME": "spacingNonLinear",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "Specify the non-linear spacing factor",
         "DEF": "0.60",
         "MIN": "0.00",
         "MAX": "1.00"
      },
      {
         "NAME": "spacingStaff",
         "ARG": "integer",
         "INFO": "The staff minimal spacing in MEI units",
         "CAT": "general layout",
         "DEF": "8",
         "MIN": "0",
         "MAX": "24"
      },
      {
         "NAME": "spacingSystem",
         "ARG": "integer",
         "INFO": "The system minimal spacing in MEI units",
         "CAT": "general layout",
         "DEF": "3",
         "MIN": "0",
         "MAX": "12"
      },
      {
         "NAME": "staffLineWidth",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The staff line width in unit",
         "DEF": "0.15",
         "MIN": "0.10",
         "MAX": "0.30"
      },
      {
         "NAME": "stemWidth",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The stem width",
         "DEF": "0.20",
         "MIN": "0.10",
         "MAX": "0.50"
      },
      {
         "NAME": "tieThickness",
         "CAT": "general layout",
         "ARG": "float",
         "INFO": "The tie thickness in MEI units",
         "DEF": "0.50",
         "MIN": "0.20",
         "MAX": "1.00"
      },
      {
         "NAME": "appXPathQuery",
         "CAT": "element selectors",
         "ARG": "string",
         "INFO": "Set the xPath query for selecting <app> child elements. By default the <lem> or the first <rdg> is selected.",
         "EXAM": "@./rdg[contains(@source, 'source-id')]",
         "REPEAT": "true"
      },
      {
         "NAME": "choiceXPathQuery",
         "CAT": "element selectors",
         "ARG": "string",
         "INFO": "Set the xPath query for selecting <choice> child elements. By default the first child is selected.",
         "EXAM": "@./orig",
         "REPEAT": "true"
      },
      {
         "NAME": "mdivXPathQuery",
         "CAT": "element selectors",
         "ARG": "string",
         "INFO": "Set the xPath query for selecting the <mdiv> to be rendered; only one <mdiv> can be rendered.",
         "DEF": "",
         "REPEAT": "true"
      },
      {
         "NAME": "substXPathQuery",
         "CAT": "element selectors",
         "ARG": "string",
         "INFO": "Set the xPath query for selecting <subst> child elements.  By default the first child is selected.",
         "EXAM": "@./del",
         "REPEAT": "true"
      },
      {
         "NAME": "defaultBottomMargin",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The default bottom margin",
         "DEF": "0.50",
         "MIN": "0.00",
         "MAX": "5.00"
      },
      {
         "NAME": "defaultLeftMargin",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The default left margin",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "defaultRightMargin",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The default right margin",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "defaultTopMargin",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The default top margin",
         "DEF": "0.50",
         "MIN": "0.00",
         "MAX": "6.00"
      },
      {
         "NAME": "leftMarginAccid",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for accid in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginBarLine",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for barLine in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginBeatRpt",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for beatRpt in MEI units",
         "DEF": "2.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginChord",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for chord in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginClef",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for clef in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginKeySig",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for keySig in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginLeftBarLine",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for left barLine in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginMensur",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for mensur in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginMeterSig",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for meterSig in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginMRest",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for mRest in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginMRpt2",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for mRpt2 in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginMultiRest",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for multiRest in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginMultiRpt",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for multiRpt in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginNote",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for note in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginRest",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for rest in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "leftMarginRightBarLine",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The margin for right barLine in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginAccid",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for accid in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginBarLine",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for barLine in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginBeatRpt",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for beatRpt in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginChord",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for chord in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginClef",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for clef in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginKeySig",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for keySig in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginLeftBarLine",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for left barLine in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginMensur",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for mensur in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginMeterSig",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for meterSig in MEI units",
         "DEF": "1.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginMRest",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for mRest in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginMRpt2",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for mRpt2 in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginMultiRest",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for multiRest in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginMultiRpt",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for multiRpt in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginNote",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for note in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginRest",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for rest in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      },
      {
         "NAME": "rightMarginRightBarLine",
         "CAT": "element margins",
         "ARG": "float",
         "INFO": "The right margin for right barLine in MEI units",
         "DEF": "0.00",
         "MIN": "0.00",
         "MAX": "2.00"
      }
   ]
}
;



//////////////////////////////
//
// HumdrumNotationPluginDatabase::initializer --
//

function HumdrumNotationPluginDatabase() {
	this.entries = {};  // Hash of notation ids and their related information.
	this.mutex = 0;
	this.waiting = [];  // Notation entries to process after verovio has loaded.
	this.ready = 0;     // Set to 1 when verovio toolkit is loaded
	HumdrumNotationPluginDatabase.prototype.prepareOptions();
	return this;
}


var HNP = new HumdrumNotationPluginDatabase();



///////////////////////////////////////////////////////////////////////////


function getContainer(baseid) {
	var entry = HNP.entries[baseid];
	if (!entry) {
		return null;
	}
	return entry.container;
}

///////////////////////////////////////////////////////////////////////////

//////////////////////////////
//
// HumdrumNotationPluginDatabase::displayWaiting --
//

HumdrumNotationPluginDatabase.prototype.displayWaiting = function () {
	// maybe check to see if document is ready (otherwise maybe infinite loop).
	for (var i=0; i<this.waiting.length; i++) {
		(function(that, j, obj) {
			setTimeout(function() {
				that.displayHumdrumNow(obj);
			}, j*250);
		}(this, i, this.waiting[i]));
	}
	this.waiting = [];
}



//////////////////////////////
//
// HumdrumNotationPluginDatabase::setErrorScore --
//

HumdrumNotationPluginDatabase.prototype.setErrorScore = function (baseid) {
	var element = document.querySelector("#" + baseid);
	if (!element) {
		console.log("Warning: Cannot find error score for ID", baseid);
		return;
	}
	var text = element.textContent.trim();
	this.errorScore = text;
	return this;
}



//////////////////////////////
//
// HumdrumNotationPluginDatabase::createEntry --
//

HumdrumNotationPluginDatabase.prototype.createEntry = function (baseid, options) {
	if (typeof baseid !== "string" && !(baseid instanceof String)) {
		console.log("Error: baseid must be a string, but it is:", baseid);
		return null;
	}
	if (!(options instanceof Object)) {
		console.log("Error: options must be an object:", options);
		return null;
	}
	if (!baseid) {
		console.log("Error: baseid cannot be empty");
		return null;
	}
	var entry = this.entries[baseid];
	if (entry) {
		console.log("Error: entry already exists:", entry);
		return entry;
	}
	var entry = new HumdrumNotationPluginEntry(baseid, options);
	this.entries[baseid] = entry;
	entry.convertFunctionNamesToRealFunctions();
	entry.createContainer();
	entry.initializeContainer();
	return entry;
};



//////////////////////////////
//
// HumdrumNotationPluginDatabase::displayHumdrumNow -- Don't wait, presumably since
//     the page has finished loading.
//

HumdrumNotationPluginDatabase.prototype.displayHumdrumNow = function (opts) {

	if (opts instanceof Element) {
		// Currently not allowed, but maybe allow the container element, and then
		// extract the options from the container (from the *-options element).
		return;
	}

	var entry = null;

	if (typeof opts === "string" || opts instanceof String) {
		// This is a base ID for a Humdrum example to display.
		entry = this.entries[opts];
		if (!entry) {
			console.log("Error: trying to create notation for an uninitialized ID");
			return;
		}
	} else if (opts instanceof Object) {
		var id = opts.target;
		if (!id) {
			id = opts.source;
		}
		if (!id) {
			console.log("Error: source ID for Humdrum element required in options");
			return;
		}
		entry = this.entries[id];
		if (!entry) {
			entry = this.createEntry(id, opts);
		}
		// copy input options into existing entry's option (in case of updates in
		// options).  This is only adding options, but there should probably be a way
		// of removing unwanted options as well...
		for (property in opts) {
			entry.options[property] = opts[property];
		}
	}

	if (!entry) {
		console.log("Error: cannot create notation for", opts);
	}

	var sourceid = entry.options["source"];
	if (!sourceid) {
		console.log("Error: Missing Humdrum data source ID:", sourceid, "in options", opts);
		return;
	}
	var source = document.querySelector("#" + sourceid);
	if (!source) {
		console.log("Error: Humdrum source location " +
				sourceid + " cannot be found.");
		return;
	}

	if (entry.options.hasOwnProperty("uri")) {
		this.downloadUriAndDisplay(entry.baseId);
	} else if (entry.options.hasOwnProperty("url")) {
		this.downloadUrlAndDisplay(entry.baseId);
	} else {
		if (entry._timer) {
			clearTimeout(entry._timer);
		}
		entry._timer = setTimeout(function() {
			entry.copyContentToContainer();
			HNP.displayHumdrumSvg(entry.baseId)
		}, 100);
	}
};



//////////////////////////////
//
// HumdrumNotationPluginDatabase::downloadUriAndDisplay --
//

HumdrumNotationPluginDatabase.prototype.downloadUriAndDisplay = function (baseid) {
	var entry = this.entries[baseid];
	if (!entry) {
		console.log("Error: Cannot find entry for URI download:", baseid);
		return;
	}

	if (entry.options.uri) {
		entry.options.processedUri = entry.options.uri;
		delete entry.options.uri;
	} else {
		console.log("Warning: No URL to download data from, presuming already downloaded", entry);
		displayHumdrumNow(entry.baseId);
		return;
	}

	var uri = entry.options.processedUri;
	var url = "";
	if (uri.match(/^(g|gh|github):\/\//i)) {
		url = this.makeUrlGithub(uri);
	} else if (uri.match(/^(h|hum|humdrum):\/\//i)) {
		url = this.makeUrlHumdrum(uri);
	} else if (uri.match(/^(j|jrp):\/\//i)) {
		url = this.makeUrlJrp(uri);
	} else if (uri.match(/^(nifc):\/\//i)) {
		url = this.makeUrlNifc(uri);
	} else if (uri.match(/^(https?):\/\//i)) {
		url = uri;
	} else {
		// Assume local file URL:
		url = uri;
	}
	if (url) {
		entry.options.url = url;
		this.downloadUrlAndDisplay(baseid);
	} else {
		console.log("Warning: No URL for URI:", uri);
	}
}



//////////////////////////////
//
// HumdrumNotationPluginDatabase::downloadUrlAndDisplay --
//

HumdrumNotationPluginDatabase.prototype.downloadUrlAndDisplay = function (baseid) {
	var entry = this.entries[baseid];
	if (!entry) {
		console.log("Error: Cannot find entry for URL download:", baseid);
		return;
	}

	if (entry.options.url) {
		entry.options.processedUrl = entry.options.url;
		delete entry.options.url;
	} else {
		console.log("Warning: No URL to download data from, presuming already downloaded", entry);
		displayHumdrumNow(entry.baseId);
		return;
	}

	var source = document.querySelector("#" + baseid);
	if (!source) {
		console.log("Error: no element for ID", baseid);
		return;
	}

	// download from url, otherwise try urlFallback:
	downloadHumdrumUrlData(source, entry.options);

};



//////////////////////////////
//
// HumdrumNotationPluginDatabase::getEmbeddedOptions --
//

HumdrumNotationPluginDatabase.prototype.getEmbeddedOptions = function (humdrumfile) {
	var lines = humdrumfile.match(/[^\r\n]+/g);
	var output = {};
	for (var i=0; i<lines.length; i++) {
		if (!lines[i].match(/^!!!/)) {
			continue;
		}
		var matches = lines[i].match(/^!!!hnp-option\s*:\s*([^\s:]+)\s*:\s*(.*)\s*$/);
		if (matches) {
			var option = matches[1];
			var value = matches[2];
			output[option] = value;
		}
	}
	return output;
};



//////////////////////////////
//
// HumdrumNotationPluginDatabase::displayHumdrumSvg -- Add default settings to
//     options and then render and show the Humdrum data as an SVG image on the page.
//

HumdrumNotationPluginDatabase.prototype.displayHumdrumSvg = function (baseid) {
	var that2 = this;
	var entry = this.entries[baseid];
	if (!entry) {
		console.log("Error: Notation entry is not defined for ID:", baseid);
		return;
	}

	if (!entry.toolkit) {
		// search for the verovio toolkit if not explicitly specified
		
		if (typeof vrvWorker !== "undefined") {
			entry.toolkit = vrvWorker;
		}
		
	}
	var toolkit = entry.toolkit;
	var sourcetext = entry.humdrum.textContent.trim();
	if (sourcetext.match(/^\s*$/)) {
		if (entry.options.errorScore) {
			var errorscore = document.querySelector("#" + entry.options.errorScore);
			if (errorscore) {
				sourcetext = errorscore.textContent.trim();
			} else {
				console.log("Error: No humdrum content in", entry.humdrum);
				console.log("For ID", baseid, "ENTRY:", entry);
				return;
			}
		} else if (this.errorScore) {
			sourcetext = this.errorScore;
			console.log("Error: No humdrum content in", entry.humdrum);
			console.log("For ID", baseid, "ENTRY:", entry);
		}

	}

	// Cannot display an empty score, since this will cause verovio to display the
	// previously prepared score.
	if (sourcetext.match(/^\s*$/)) {
		
		//console.log("Error: No humdrum content in", entry.humdrum);
		//console.log("For ID", baseid, "ENTRY:", entry);
		// Sleep for a while and try again.
		// This is now necessary since verovio
		// is in a separate thread, and data being
		// converted from MusicXML or MEI may not
		// yet be ready (it will be converted into Humdrum
		// data which this function is waiting for).
		// Maybe later change this function to be called
		// after the MusicXML/MEI data has been converted.
		// Maybe have a counter to limit the waiting time.
		var that = this;
		setTimeout(function() {
			that.displayHumdrumSvg(baseid);
		}, 100)
		
		return;
	}

	var preventRendering = false;
	if (entry.options.suppressSvg) {
		preventRendering = true;
		// Maybe set entry.options.suppressSvg to false here.

		entry.container.style.display = "none";
		entry.options._processedSuppressSvg = entry.options.suppressSvg;
		delete entry.options.suppressSvg;
		entry.container.style.display = "none";
		return;
	} else {
		entry.container.style.display = "block";
	}

	var pluginOptions = this.getEmbeddedOptions(sourcetext);
	for (var property in entry.options) {
		if (!entry.options.hasOwnProperty(property)) {
			// not a real property of object
			continue;
		}
		pluginOptions[property] = entry.options[property];
	}

	var vrvOptions = this.extractVerovioOptions(baseid, pluginOptions);
	vrvOptions = this.insertDefaultOptions(baseid, vrvOptions);

	sourcetext += "\n" + getFilters(pluginOptions);

	if (pluginOptions.appendText) {
		var text = pluginOptions.appendText;
		if (Array.isArray(text)) {
			for (var i=0; i<text.length; i++) {
				if (typeof text[i] === "string" || text[i] instanceof String) {
					sourcetext += "\n" + text.trim()
				}
			}
		} else if (typeof text === "string" || text instanceof String) {
			sourcetext += "\n" + text.trim()
		}
	}

	if (pluginOptions.prepareData) {
		try {
			sourcetext = pluginOptions.prepareData(baseid, sourcetext);
		} catch (error) {
			sourcetext = executeFunctionByName(pluginOptions.prepareData, window, [baseid, sourcetext]);
		}
	}

	
	vrvWorker.renderData(vrvOptions, sourcetext)
	.then(function(svg) {
		entry.svg.innerHTML = svg;
		// clear the height styling which may have been given as a placeholder:
		entry.container.style.height = "";

		if (pluginOptions.postFunction) {
			// Need to run a function after the image has been created or redrawn
			try {
				pluginOptions.postFunction(baseid, that2);
			} catch (error) {
				executeFunctionByName(pluginOptions.postFunction, window, [baseid, that2]);
			}
			pluginOptions._processedPostFunction = pluginOptions.postFunction;
			delete pluginOptions.postFunction;
		}
		pluginOptions._currentPageWidth = vrvOptions.pageWidth;

		// Update stored options
		var autoresize = pluginOptions.autoResize === "true" ||
	                 	pluginOptions.autoResize === true ||
	                 	pluginOptions.autoResize === 1;

		if (autoresize && !pluginOptions._autoResizeInitialize) {
			// need to inialize a resize callback for this image.
			pluginOptions._autoResizeInitialize = true;
			var aridelement = entry.container.parentNode;

			if (aridelement && (!entry._resizeObserver || entry._resizeCallback)) {
				try {

					var _debounce = function(ms, fn) {
  						return function() {
							if (entry._timer) {
    							clearTimeout(entry._timer);
							}
    						var args = Array.prototype.slice.call(arguments);
    						args.unshift(this);
    						entry._timer = setTimeout(fn.bind.apply(fn, args), ms);
  						};
					};

					entry._resizeObserver = new ResizeObserver(_debounce(500, function(event) {
						(function(bid) {
							displayHumdrum(bid);
						})(baseid);
					}));
					entry._resizeObserver.observe(aridelement);

				} catch (error) {

					// ResizeObserver is not present for this browser, use setInterval instead.
					var refreshRate = 250; // milliseconds
					entry._resizeCallback = setInterval(function() {
						(function(bid) {
							checkParentResize(bid);
						})(baseid)
					}, refreshRate);

				}
			} else if (!aridelement) {
				window.addEventListener("resize", function(event) {
					(function(bid) {
						displayHumdrum(bid);
					})(baseid);
				});
			}
		}
	})
	.then(function() {
		vrvWorker.getHumdrum()
		.then(function(humdrumdata) {
			this.humdrumOutput
			entry.humdrumOutput = humdrumdata;
			if (pluginOptions.postFunctionHumdrum) {
				// Need to run a function after the image has been created or redrawn
				try {
					pluginOptions.postFunctionHumdrum(entry.humdrumOutput, baseid, that2);
				} catch (error) {
					executeFunctionByName(pluginOptions.postFunctionHumdrum, window, [entry.humdrumOutput, baseid, that2]);
				}
				pluginOptions._processedPostFunction = pluginOptions.postFunctionHumdrum;
				delete pluginOptions.postFunctionHumdrum;
			}

		});
	});
	
};



//////////////////////////////
//
// HumdrumNotationPluginEntry::insertDefaultOptions --
//

HumdrumNotationPluginDatabase.prototype.insertDefaultOptions = function (baseid, vrvOptions) {
	var entry = this.entries[baseid];
	if (!entry) {
		console.log("Error: need an entry for baseid:", baseid);
		return vrvOptions;
	}
	if (entry.options.header === "true" ||
       entry.options.header === true ||
       entry.options.header === 1) {
		vrvOptions.header = "encoded";
	}

	if (!vrvOptions.hasOwnProperty("scale")) {
		// scale must be set before automatic pageWidth calculations
		vrvOptions.scale = 40;
	}

	if (!vrvOptions.hasOwnProperty("pageMarginTop")) {
		vrvOptions.pageMarginTop = 100;
	}

	if (!vrvOptions.pageWidth) {
		// set the width of the notation automatically to the width of the parent element
		var style = window.getComputedStyle(entry.container, null);
		var width = parseInt(style.getPropertyValue("width"));
		vrvOptions.pageWidth = width;
		if (vrvOptions.scale) {
			vrvOptions.pageWidth /= (parseInt(vrvOptions.scale)/100.0);
		}
	}

	if (!vrvOptions.hasOwnProperty("pageHeight")) {
		vrvOptions.pageHeight = 60000;
	}
	if (entry.options.incipit === "true" ||
       entry.options.incipit === 1 ||
		 entry.options.incipit === true) {
		vrvOptions.pageHeight = 100;
	}

	if (!vrvOptions.hasOwnProperty("staffLineWidth")) {
		vrvOptions.staffLineWidth = 0.12;
	}
	if (!vrvOptions.hasOwnProperty("barLineWidth")) {
		vrvOptions.barLineWidth = 0.12;
	}
	if (!vrvOptions.hasOwnProperty("from")) {
		vrvOptions.from = "auto";
	}
	if (!vrvOptions.hasOwnProperty("from")) {
		vrvOptions.from = "auto";
	}

	// Need to superimpose default options since verovio will keep old
	// options persistent from previously generated examples.
	if (this.verovioOptions) {
		for (var i=0; i<this.verovioOptions.OPTION.length; i++) {
			var option = this.verovioOptions.OPTION[i];
			var name = option.NAME;
			if (option.CLI_ONLY === "true" ||
			    option.CLI_ONLY === true ||
				 option.CLI_ONLY === 1) {
				continue;
			}
			if (vrvOptions.hasOwnProperty(name)) {
				// Option is already set, so do not give a default.
				// Probably check if it is in valid range here, though.
				continue;
			}
			// Ignore previously dealt-with options:
			if (name === "scale")          { continue; }
			if (name === "pageWidth")      { continue; }
			if (name === "pageHeight")     { continue; }
			if (name === "staffLineWidth") { continue; }
			if (name === "barLineWidth")   { continue; }
			if (name === "from")           { continue; }

			// Fill in default values for parameters that are not set:
			if ((option.ARG === "integer") && (typeof option.DEF !== 'undefined')) {
				vrvOptions[name] = parseInt(option.DEF);
			} else if ((option.ARG === "float") && (typeof option.DEF !== 'undefined')) {
				vrvOptions[name] = parseFloat(option.DEF);
			}
			// Maybe add string and boolean options here.

		}
	}

	// Deal with default options for boolean and string cases:
	if (!vrvOptions.hasOwnProperty("adjustPageHeight")) {
		vrvOptions.adjustPageHeight = 1;
	}
	if (!vrvOptions.hasOwnProperty("breaks")) {
		vrvOptions.breaks = "auto";
	}
	if (!vrvOptions.hasOwnProperty("font")) {
		vrvOptions.font = "Leipzig";
	}
	if (!vrvOptions.hasOwnProperty("humType")) {
		vrvOptions.humType = 1;
	}
	if (!vrvOptions.hasOwnProperty("footer")) {
		vrvOptions.footer = "none";
	}
	if (!vrvOptions.hasOwnProperty("header")) {
		vrvOptions.header = "none";
	}

	return vrvOptions;
};



//////////////////////////////
//
// HumdrumNotationPluginDatabase::extractVerovioOptions -- Extract all of the verovio options
//   from the Humdrum plugin options object.
//

HumdrumNotationPluginDatabase.prototype.extractVerovioOptions = function (baseid, opts) {
	var entry = this.entries[baseid];
	if (!entry) {
		console.log("Error: Need entry for creating verovio options:", baseid);
		return;
	}

	var output = {};

	if (!opts) {
		opts = entry.options;
	}

	if (opts.scale) {
		var scale = parseFloat(opts.scale);
		if (scale < 0.0) {
			scale = -scale;
		}
		if (scale <= 1.0) {
			scale = 100.0 * scale;
		}
		output.scale = scale;
	}

	for (var property in opts) {
		if (property === "scale") {
			// scale option handled above
			continue;
		}
		if (typeof this.verovioOptions[property] === 'undefined') {
			// not a verovio option
			continue;
		}
		// Do error-checking of prameters here.
		output[property] = opts[property];
	}

	return output;
}



//////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlGithub --
//

HumdrumNotationPluginDatabase.prototype.makeUrlGithub = function (uri, opts) {
	var url = uri;
	var matches = uri.match(/^(g|gh|github):\/\/([^\/]+)\/([^\/]+)\/(.*)\s*$/);
	if (matches) {
		var account = matches[2];
		var repo    = matches[3];
		var file    = matches[4];
		var variant;
		if (opts && opts.commitHash && (typeof opts.commitHash === "string" || text instanceof String)) {
			variant = opts.commitHash;
		} else {
			variant = "master";
		}
		url = "https://raw.githubusercontent.com/" + account + "/" + repo + "/" + variant + "/" + file;
	}
	return url;
};



///////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlHumdrum -- Convert a (kernScores) Humdrum URI into a URL.
//

HumdrumNotationPluginDatabase.prototype.makeUrlHumdrum = function (uri, opts) {
	var url = uri;
	var matches = uri.match(/^(h|hum|humdrum):\/\/(.*)\s*$/);
	if (matches) {
		url = "https://kern.humdrum.org/data?s=" + matches[2];
	}
	return url;
}



///////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlJrp -- Convert a (kernScores) JRP URI into a URL.
//

HumdrumNotationPluginDatabase.prototype.makeUrlJrp = function (uri, opts) {
	var url = uri;
	var composerid;
	var jrpid;
	var filename;
	var composerid;
	var matches = uri.match(/^(j|jrp):\/\/([a-z]{3})(\d{4}[a-z]*)-?(.*)$\s*$/i);
	if (matches) {
		composerid = matches[2].toLowerCase();
		composerid = composerid.charAt(0).toUpperCase() + composerid.substr(1);
		jrpid = composerid + matches[3].toLowerCase();
		filename = matches[4];
		if (filename) {
			jrpid += "-" + filename;
		}
		url = "https://jrp.ccarh.org/cgi-bin/jrp?a=humdrum&f=" + jrpid;
	}
	return url;
}



///////////////////////////////
//
// HumdrumNotationPluginDatabase::makeUrlNifc -- Convert a NIFC URI into a URL.
//

HumdrumNotationPluginDatabase.prototype.makeUrlNifc = function (uri, opts) {
	var url = uri;
	var matches = uri.match(/^(?:nifc):\/\/(.*)$/i);
	if (matches) {
		var filename = matches[1];
		url = "https://humdrum.nifc.pl/" + filename;
	}
	return url;
}





//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/ReferenceRecords.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
//	This file contains the ReferenceRecord class for 
// the Humdrum notation plugin.  This class is used by
// the ReferenceRecords class to store a particular
// reference record.
//


//////////////////////////////
//
// ReferenceRecords::initializer --
//

function ReferenceRecord(lineindex, linetext) {
	clear();
	setLineIndex(lineindex);
	setLineText(linetext);
	return this;
}



//////////////////////////////
//
// ReferenceRecords::clear --
//

ReferenceRecord.prototype.clear = function () {
	this.line         = -1;  // line index: offset from 0 for first line in file.
	this.text         = "";
	clearParsedData();
	return this;
}



//////////////////////////////
//
// ReferenceRecords::clearParsedData --
//

ReferenceRecord.prototype.clearParsedData = function () {
	this.key          = "";
	this.keyBase      = "";
	this.keyAt        = "";
	this.keyVariant   = "";
	this.keyCount     = "";
	this.value        = "";
	return this;
};



//////////////////////////////
//
// ReferenceRecords::setLineIndex --
//
ReferenceRecord.prototype.setLineIndex = function (lineindex) {
	try {
		this.line = parseInt(lineindex);
	} catch (error) {
		this.line = -1;
	}
	return this;
};



//////////////////////////////
//
// ReferenceRecords::setLineText --
//

ReferenceRecord.prototype.setLineText = function (linetext) {
	if (typeof linetext === "string" || linetext instanceof String) {
		this.text = linetext;
		parseTextLine();
	} else {
		clear();
	}
	return this;
}



//////////////////////////////
//
// ReferenceRecords::parseTextLine --
//

ReferenceRecord.prototype.parseTextLine = function () {
	// this.key          = The complete reference key.
	// this.keyBase      = The reference key without langauge, count or variant qualifiers.
	// this.keyAt        = The language qualification, including the @ signs.
	// this.keyVariant = The variant qualification (a dash followed by text).
	// this.keyCount     = A Number following a keyBase, before keyAt or keyQual.
	clearParsedData();
	var matches = text.match(/^!!![^!:]+\s*:\s*(.*)\s*$/);
	if (matches) {
		this.keyBase = matches[1];
		this.key     = matches[1];
		this.value   = matches[2];
	}
	matches = this.keyBase.match(/^([^@]+)(@+.*)$/);
	if (matches) {
		this.keyBase = matches[1];
		this.keyAt = matches[2];
	}
	matches = this.keyBase.match(/^([^-]+)-(.+)$/);
	if (matches) {
		this.keyBase    = matches[1];
		this.keyVariant = matches[2];
	}
	// order of language and variant is not defined (so allow either to be first).
	matches = this.keyAt.match(/^([^-]+)-(.+)$/);
	if (matches) {
		this.keyAt      = matches[1];
		this.keyVariant = matches[2];
	}
	return this;
}




//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/ReferenceRecords.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
//	This file contains the ReferenceRecords class for 
// the Humdrum notation plugin.  This class is used to access
// the reference records in a Humdrum file.
//


//////////////////////////////
//
// ReferenceRecords::initializer --
//

function ReferenceRecords(humdrumfile) {
	this.sequence = [];  // The order that the Humdrum records are found in the file
	this.database = {};  // Hash of the records by ReferenceRecord::keyBase
	parseReferenceRecords(humdrumfile);
	return this;
}



//////////////////////////////
//
// ReferenceRecords::parseReferenceRecords --
//

ReferenceRecords.prototype.parseReferenceRecords = function (humdrumfile) {
	var lines = [];
	if (typeof linetext === "string" || linetext instanceof String) {
		lines = humdrumfile.match(/[^\r\n]+/g);
	} else if (Object.prototype.toString.call(humdrumfile) === '[object Array]') {
		if (humdrumfile[0] === "string" || humdrumfile[0] instanceof String) {
			line = humdrumfile;
		}
	} else {
		// check if an HTML element and load text from there.
		var ishtml = false;
  		try {
			ishtml = obj instanceof HTMLElement ? true : false;
  		}
  		catch(e){
    		//Browsers not supporting W3 DOM2 don't have HTMLElement and
    		//an exception is thrown and we end up here. Testing some
    		//properties that all elements have (works on IE7)
    		if ((typeof obj === "object") &&
      			(obj.nodeType === 1) && (typeof obj.style === "object") &&
      			(typeof obj.ownerDocument ==="object")) {
				ishtml = true;
			}
		}
		if (ishtml) {
			lines = humdrumfile.innerHTML.match(/[^\r\n]+/g);
		}
	}
	for (i=0; i<lines.length; i++) {
		if (!lines[i].match(/^!!![^!:]/)) {
			var record = new HumdrumRecord(i, lines[i]);
			this.sequence.push(record);
			var key = record.keyBase;
			if (!this.database[key]) {
				this.database[key] = [ record ];
			} else {
				this.database[key].push(record);
			}
		}
	}
	return this;
}



//////////////////////////////
//
// ReferenceRecords::getReferenceFirst -- Get the first reference record
//    which matches the given key.  This function will ignore qualifiers,
//    counts or variants on the key (KEY2 will map to KEY, KEY@@LANG will map
//    to KEY, KEY-variant will map to KEY).
//

ReferenceRecords.prototype.getReferenceFirst = function (keyBase) {
	// return the first keyBase record
	var items  = this.database[keyBase];
	if (!items) {
		return "";
	} else if (items.length > 0) {
		return items[0];
	} else {
		return "";
	}
}



//////////////////////////////
//
// ReferenceRecords::getReferenceAll -- Get all reference records that match to key.
//

ReferenceRecords.prototype.getReferenceAll = function (keyBase) {
	// if keyBase is empty, then return all records:
	if (!keyBase) {
		return this.sequence;
	}
	// return all keyBase records
	var items  = this.database[keyBase];
	if (!items) {
		return [];
	} else if (items.length > 0) {
		return items[0];
	} else {
		return [];
	}
}



//////////////////////////////
//
// ReferenceRecords::getReferenceFirstExact -- 
//

ReferenceRecords.prototype.getReferenceFirstExact = function (key) {
	// return first matching key record
	var list = getReferenceAll(key)
	for (var i=0; i<list.length; i++) {
		if (list[i].key === key) {
			return list[i];
		}
	}
	return "";
}



//////////////////////////////
//
// ReferenceRecords::getReferenceAllExact -- 
//

ReferenceRecords.prototype.getReferenceAllExact = function (key) {
	// return all matching key record
	var list = getReferenceAll(key)
	var output = [];
	for (var i=0; i<list.length; i++) {
		if (list[i].key === key) {
			output.push(list[i]);
		}
	}
	return output;
}






	// vim: ts=3
// This is the Web Worker interface for the verovio toolkit.  These functions are
// interfaced through the verovio-calls.js functions.
//


//////////////////////////////
//
// vrvInterface::vrvInterface --
//

function vrvInterface(use_worker, onReady) {
	this.WIDTH = 0;
	this.HEIGHT = 0;
	this.page = 1;
	this.pageCount = 0;
	this.options = {};

	this.initialized = false;
	this.usingWorker = use_worker;

	if (use_worker) {
		this.createWorkerInterface(onReady);
	} else {
		this.createDefaultInterface(onReady);
	}
}



//////////////////////////////
//
// vrvInterface::createWorkerInterface --
//

vrvInterface.prototype.createWorkerInterface = function (onReady) {
	var vrv = this;

	function handleEvent(oEvent) {
		switch(oEvent.data.method) {
			case "ready":
				vrv.initialized = true;
				onReady();
				break;
			default:
				while (vrv.resolvedIdx <= oEvent.data.idx) {
					//resolve or reject
					if (vrv.resolvedIdx === oEvent.data.idx) {
						if (oEvent.data.success) {
							vrv.promises[vrv.resolvedIdx].deferred.resolve(oEvent.data.result);
						} else {
						vrv.promises[vrv.resolvedIdx].deferred.reject(oEvent.data.result);
						};
					} else {
						vrv.promises[vrv.resolvedIdx].deferred.reject();
					};
					if (vrv.promises[vrv.resolvedIdx].method === "renderData") {
						vrv.renderDataPending--;
						if (vrv.renderDataPending === 0) vrv.handleWaitingRenderData();
					};
					delete vrv.promises[vrv.resolvedIdx];
					vrv.resolvedIdx++;
				};
		};
	};

	// console.log("creating worker interface");
	this.promises = {};
	this.promiseIdx = 0;
	this.resolvedIdx = 0;
	this.renderDataPending = 0;
	this.renderDataWaiting = null;

/*
	var request = new XMLHttpRequest();
	request.open("GET", "https://plugin.humdrum.org/scripts/verovio-worker.js");
	request.responseType = "blob";
	request.onload = function(event) {
		var blob = this.response;
		this.worker = new Worker(window.URL.createObjectURL(blob));
		this.worker.addEventListener("message", handleEvent);
	}
	request.send();
*/

//	this.worker = new Worker("https://plugin.humdrum.org/scripts/verovio-worker.js");
//	this.worker.addEventListener("message", handleEvent);



	var workerUrl = "scripts/verovio-worker.js";
	console.log("LOADING" + workerUrl);
	this.worker = null;
	var that = this;
	try {
		that.worker = new Worker(workerUrl);
		that.worker.addEventListener("message", handleEvent);

		that.worker.onerror = function (event) {
			event.preventDefault();
			that.worker = createWorkerFallback(workerUrl);
			that.worker.addEventListener("message", handleEvent);
		};
	} catch (e) {
		that.worker = createWorkerFallback(workerUrl);
		that.worker.addEventListener("message", handleEvent);
	}
};



//////////////////////////////
//
// createWorkerFallback -- Cross-origin worker
//

function createWorkerFallback(workerUrl) {
	console.log("Getting cross-origin worker");
	var worker = null;
	try {
		var blob;
		try {
			blob = new Blob(["importScripts('" + workerUrl + "');"], { "type": 'application/javascript' });
		} catch (e) {
			var blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
			blobBuilder.append("importScripts('" + workerUrl + "');");
			blob = blobBuilder.getBlob('application/javascript');
		}
		var url = window.URL || window.webkitURL;
		var blobUrl = url.createObjectURL(blob);
		worker = new Worker(blobUrl);
	} catch (e1) {
		//if it still fails, there is nothing much we can do
	}
	return worker;
}



//////////////////////////////
//
// vrvInterface::createDefaultInterface --
//

vrvInterface.prototype.createDefaultInterface = function (onReady) {

/*  No longer needed?


	var url = 'https://verovio-script.humdrum.org/scripts/verovio-toolkit.js';


	console.log("create default interface")
	var vrv = this;
	this.verovio = new verovioCalls();

	var script = document.createEleent('script');
	script.onload = function () {
		vrv.verovio.vrvToolkit = new verovio.toolkit();
		vrv.initialized = true;
		onReady();
	};
	script.src = url;
	document.head.appendChild(script);

/* verovio toolkit is larger than allowed by localStorage (5 MB limit), so
 * using basket to store it between sessions is not useful to use:

	basket
	.require(
		{url: url, expire: 500, unique: BasketVersion}
		// loaded as an include:
		// {url: "scripts/ace/humdrumValidator.js", skipCache: true}
	)
	.then(
		function () {
			vrv.verovio.vrvToolkit = new verovio.toolkit();
			vrv.initialized = true;
			onReady();
		},
		function () {
			console.log("There was an error loading script", url);
		}
	);
*/




};



//////////////////////////////
//
// vrvInterface::checkInitialized --
//

vrvInterface.prototype.checkInitialized = function () {
	if (!this.initialized) throw("Verovio toolkit not (yet) initialized");
};



//////////////////////////////
//
// vrvInterface::filterData --
//

vrvInterface.prototype.filterData = function (opts, data, type) {
	// Don't store options when filtering data.
	return this.execute("filterData", arguments);
};



//////////////////////////////
//
// vrvInterface::renderData --
//

vrvInterface.prototype.renderData = function (opts, data, page) {
	// console.log("%cvrvInterface.renderData", "color: #aa8800; font-weight: bold");
	this.options = opts;
	return this.execute("renderData", arguments);
};



//////////////////////////////
//
// vrvInterface::getHumdrum --
//

vrvInterface.prototype.getHumdrum = function () {
	// console.log("%cvrvInterface.getHumdrum", "color: #aa8800; font-weight: bold");
	var value = this.execute("getHumdrum", arguments);
	return value;
};



//////////////////////////////
//
// vrvInterface::redoLayout --
//

vrvInterface.prototype.redoLayout = function (opts, redo, measure) {
	// console.log("%cvrvInterface.redoLayout", "color: #8800aa; font-weight: bold");
	this.options = opts;
	return this.execute("redoLayout", arguments);
};



//////////////////////////////
//
// vrvInterface::renderPage --
//

vrvInterface.prototype.renderPage = function (page) {
	return this.execute("renderPage", arguments);
};



//////////////////////////////
//
// vrvInterface::renderAllPages --
//

vrvInterface.prototype.renderAllPages = function (data, opts) {
	return this.execute("renderAllPages", arguments);
};



//////////////////////////////
//
// vrvInterface::gotoPage --
//

vrvInterface.prototype.gotoPage = function (page) {
	var vrv = this;
	return this.execute("gotoPage", arguments)
	.then(function (obj) {
		vrv.page = obj.page;
		vrv.pageCount = obj.pageCount;
		return page;
	});
};



//////////////////////////////
//
// vrvInterface::getMEI --
//

vrvInterface.prototype.getMEI = function (page) {
	return this.execute("getMEI", arguments);
};



//////////////////////////////
//
// vrvInterface::renderToMidi --
//

vrvInterface.prototype.renderToMidi = function () {
	var value = this.execute("renderToMidi", arguments);
	return value;
};



//////////////////////////////
//
// vrvInterface::getElementsAtTime --
//

vrvInterface.prototype.getElementsAtTime = function (vrvTime) {
	return this.execute("getElementsAtTime", arguments);
};



//////////////////////////////
//
// vrvInterface::getTimeForElement --
//

vrvInterface.prototype.getTimeForElement = function (id) {
	return this.execute("getTimeForElement", arguments);
};



//////////////////////////////
//
// vrvInterface::execute --
//

vrvInterface.prototype.execute = function (method, args) {
	var vrv = this;
	if (this.usingWorker) {
		var arr = Array.prototype.slice.call(args);
		switch(method) {
			case "renderData":
				return vrv.postRenderData(method, arr);
			default:
				vrv.handleWaitingRenderData();
				return vrv.post(method, arr);
		};
	} else {
		return new RSVP.Promise(function (resolve, reject) {
			try {
				vrv.checkInitialized();
				resolve(vrv.verovio[method].apply(vrv.verovio, args));
			} catch(err) {
				reject(err);
			};
		});
	};
};



//////////////////////////////
//
// vrvInterface::handleWaitingRenderData --
//

vrvInterface.prototype.handleWaitingRenderData = function () {
	if (this.renderDataWaiting) {
		this.postDeferredMessage("renderData",
				this.renderDataWaiting.args,
				this.renderDataWaiting.deferred);
		this.renderDataWaiting = null;
		this.renderDataPending++;
	};
};



//////////////////////////////
//
// vrvInterface::postRenderData --
//

vrvInterface.prototype.postRenderData = function (method, args) {
	// squash pending renderings:
	if (this.renderDataPending > 0) {
		if (!this.renderDataWaiting) {
			this.renderDataWaiting = {
				deferred: new RSVP.defer(),
			};
		};
		this.renderDataWaiting.args = args;
		return this.renderDataWaiting.deferred.promise;
	} else {
		this.renderDataPending++;
		this.renderDataWaiting = null;
		return this.post(method, args);
	};
};



//////////////////////////////
//
// vrvInterface::post --
//

vrvInterface.prototype.post = function (method, args) {
	return this.postDeferredMessage(method, args, new RSVP.defer());
};



//////////////////////////////
//
// vrvInterface::postDeferredMessage --
//

vrvInterface.prototype.postDeferredMessage = function (method, args, deferred) {
	this.worker.postMessage({
		idx: this.promiseIdx,
		method: method,
		args: args
	});
	this.promises[this.promiseIdx] = {
		method: method,
		deferred: deferred
	};
	this.promiseIdx++;
	return deferred.promise;
};




	/*!
* basket.js
* v0.5.2 - 2015-02-07
* http://addyosmani.github.com/basket.js
* (c) Addy Osmani;  License
* Created by: Addy Osmani, Sindre Sorhus, Andrée Hansson, Mat Scales
* Contributors: Ironsjp, Mathias Bynens, Rick Waldron, Felipe Morais
* Uses rsvp.js, https://github.com/tildeio/rsvp.js
*/
(function(){"use strict";function a(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1}function b(a){var b=a._promiseCallbacks;return b||(b=a._promiseCallbacks={}),b}function c(a,b){return"onerror"===a?void rb.on("error",b):2!==arguments.length?rb[a]:void(rb[a]=b)}function d(a){return"function"==typeof a||"object"==typeof a&&null!==a}function e(a){return"function"==typeof a}function f(a){return"object"==typeof a&&null!==a}function g(){}function h(){setTimeout(function(){for(var a,b=0;b<wb.length;b++){a=wb[b];var c=a.payload;c.guid=c.key+c.id,c.childGuid=c.key+c.childId,c.error&&(c.stack=c.error.stack),rb.trigger(a.name,a.payload)}wb.length=0},50)}function i(a,b,c){1===wb.push({name:a,payload:{key:b._guidKey,id:b._id,eventName:a,detail:b._result,childId:c&&c._id,label:b._label,timeStamp:ub(),error:rb["instrument-with-stack"]?new Error(b._label):null}})&&h()}function j(){return new TypeError("A promises callback cannot return that same promise.")}function k(){}function l(a){try{return a.then}catch(b){return Bb.error=b,Bb}}function m(a,b,c,d){try{a.call(b,c,d)}catch(e){return e}}function n(a,b,c){rb.async(function(a){var d=!1,e=m(c,b,function(c){d||(d=!0,b!==c?q(a,c):s(a,c))},function(b){d||(d=!0,t(a,b))},"Settle: "+(a._label||" unknown promise"));!d&&e&&(d=!0,t(a,e))},a)}function o(a,b){b._state===zb?s(a,b._result):b._state===Ab?(b._onError=null,t(a,b._result)):u(b,void 0,function(c){b!==c?q(a,c):s(a,c)},function(b){t(a,b)})}function p(a,b){if(b.constructor===a.constructor)o(a,b);else{var c=l(b);c===Bb?t(a,Bb.error):void 0===c?s(a,b):e(c)?n(a,b,c):s(a,b)}}function q(a,b){a===b?s(a,b):d(b)?p(a,b):s(a,b)}function r(a){a._onError&&a._onError(a._result),v(a)}function s(a,b){a._state===yb&&(a._result=b,a._state=zb,0===a._subscribers.length?rb.instrument&&xb("fulfilled",a):rb.async(v,a))}function t(a,b){a._state===yb&&(a._state=Ab,a._result=b,rb.async(r,a))}function u(a,b,c,d){var e=a._subscribers,f=e.length;a._onError=null,e[f]=b,e[f+zb]=c,e[f+Ab]=d,0===f&&a._state&&rb.async(v,a)}function v(a){var b=a._subscribers,c=a._state;if(rb.instrument&&xb(c===zb?"fulfilled":"rejected",a),0!==b.length){for(var d,e,f=a._result,g=0;g<b.length;g+=3)d=b[g],e=b[g+c],d?y(c,d,e,f):e(f);a._subscribers.length=0}}function w(){this.error=null}function x(a,b){try{return a(b)}catch(c){return Cb.error=c,Cb}}function y(a,b,c,d){var f,g,h,i,k=e(c);if(k){if(f=x(c,d),f===Cb?(i=!0,g=f.error,f=null):h=!0,b===f)return void t(b,j())}else f=d,h=!0;b._state!==yb||(k&&h?q(b,f):i?t(b,g):a===zb?s(b,f):a===Ab&&t(b,f))}function z(a,b){var c=!1;try{b(function(b){c||(c=!0,q(a,b))},function(b){c||(c=!0,t(a,b))})}catch(d){t(a,d)}}function A(a,b,c){return a===zb?{state:"fulfilled",value:c}:{state:"rejected",reason:c}}function B(a,b,c,d){this._instanceConstructor=a,this.promise=new a(k,d),this._abortOnReject=c,this._validateInput(b)?(this._input=b,this.length=b.length,this._remaining=b.length,this._init(),0===this.length?s(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&s(this.promise,this._result))):t(this.promise,this._validationError())}function C(a,b){return new Db(this,a,!0,b).promise}function D(a,b){function c(a){q(f,a)}function d(a){t(f,a)}var e=this,f=new e(k,b);if(!tb(a))return t(f,new TypeError("You must pass an array to race.")),f;for(var g=a.length,h=0;f._state===yb&&g>h;h++)u(e.resolve(a[h]),void 0,c,d);return f}function E(a,b){var c=this;if(a&&"object"==typeof a&&a.constructor===c)return a;var d=new c(k,b);return q(d,a),d}function F(a,b){var c=this,d=new c(k,b);return t(d,a),d}function G(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function H(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function I(a,b){this._id=Jb++,this._label=b,this._state=void 0,this._result=void 0,this._subscribers=[],rb.instrument&&xb("created",this),k!==a&&(e(a)||G(),this instanceof I||H(),z(this,a))}function J(){this.value=void 0}function K(a){try{return a.then}catch(b){return Lb.value=b,Lb}}function L(a,b,c){try{a.apply(b,c)}catch(d){return Lb.value=d,Lb}}function M(a,b){for(var c,d,e={},f=a.length,g=new Array(f),h=0;f>h;h++)g[h]=a[h];for(d=0;d<b.length;d++)c=b[d],e[c]=g[d+1];return e}function N(a){for(var b=a.length,c=new Array(b-1),d=1;b>d;d++)c[d-1]=a[d];return c}function O(a,b){return{then:function(c,d){return a.call(b,c,d)}}}function P(a,b){var c=function(){for(var c,d=this,e=arguments.length,f=new Array(e+1),g=!1,h=0;e>h;++h){if(c=arguments[h],!g){if(g=S(c),g===Mb){var i=new Kb(k);return t(i,Mb.value),i}g&&g!==!0&&(c=O(g,c))}f[h]=c}var j=new Kb(k);return f[e]=function(a,c){a?t(j,a):void 0===b?q(j,c):b===!0?q(j,N(arguments)):tb(b)?q(j,M(arguments,b)):q(j,c)},g?R(j,f,a,d):Q(j,f,a,d)};return c.__proto__=a,c}function Q(a,b,c,d){var e=L(c,d,b);return e===Lb&&t(a,e.value),a}function R(a,b,c,d){return Kb.all(b).then(function(b){var e=L(c,d,b);return e===Lb&&t(a,e.value),a})}function S(a){return a&&"object"==typeof a?a.constructor===Kb?!0:K(a):!1}function T(a,b){return Kb.all(a,b)}function U(a,b,c){this._superConstructor(a,b,!1,c)}function V(a,b){return new U(Kb,a,b).promise}function W(a,b){return Kb.race(a,b)}function X(a,b,c){this._superConstructor(a,b,!0,c)}function Y(a,b){return new Rb(Kb,a,b).promise}function Z(a,b,c){this._superConstructor(a,b,!1,c)}function $(a,b){return new Z(Kb,a,b).promise}function _(a){throw setTimeout(function(){throw a}),a}function ab(a){var b={};return b.promise=new Kb(function(a,c){b.resolve=a,b.reject=c},a),b}function bb(a,b,c){return Kb.all(a,c).then(function(a){if(!e(b))throw new TypeError("You must pass a function as map's second argument.");for(var d=a.length,f=new Array(d),g=0;d>g;g++)f[g]=b(a[g]);return Kb.all(f,c)})}function cb(a,b){return Kb.resolve(a,b)}function db(a,b){return Kb.reject(a,b)}function eb(a,b,c){return Kb.all(a,c).then(function(a){if(!e(b))throw new TypeError("You must pass a function as filter's second argument.");for(var d=a.length,f=new Array(d),g=0;d>g;g++)f[g]=b(a[g]);return Kb.all(f,c).then(function(b){for(var c=new Array(d),e=0,f=0;d>f;f++)b[f]&&(c[e]=a[f],e++);return c.length=e,c})})}function fb(a,b){gc[_b]=a,gc[_b+1]=b,_b+=2,2===_b&&Tb()}function gb(){var a=process.nextTick,b=process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);return Array.isArray(b)&&"0"===b[1]&&"10"===b[2]&&(a=setImmediate),function(){a(lb)}}function hb(){return function(){vertxNext(lb)}}function ib(){var a=0,b=new dc(lb),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function jb(){var a=new MessageChannel;return a.port1.onmessage=lb,function(){a.port2.postMessage(0)}}function kb(){return function(){setTimeout(lb,1)}}function lb(){for(var a=0;_b>a;a+=2){var b=gc[a],c=gc[a+1];b(c),gc[a]=void 0,gc[a+1]=void 0}_b=0}function mb(){try{var a=require("vertx");return a.runOnLoop||a.runOnContext,hb()}catch(b){return kb()}}function nb(a,b){rb.async(a,b)}function ob(){rb.on.apply(rb,arguments)}function pb(){rb.off.apply(rb,arguments)}var qb={mixin:function(a){return a.on=this.on,a.off=this.off,a.trigger=this.trigger,a._promiseCallbacks=void 0,a},on:function(c,d){var e,f=b(this);e=f[c],e||(e=f[c]=[]),-1===a(e,d)&&e.push(d)},off:function(c,d){var e,f,g=b(this);return d?(e=g[c],f=a(e,d),void(-1!==f&&e.splice(f,1))):void(g[c]=[])},trigger:function(a,c){var d,e,f=b(this);if(d=f[a])for(var g=0;g<d.length;g++)(e=d[g])(c)}},rb={instrument:!1};qb.mixin(rb);var sb;sb=Array.isArray?Array.isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)};var tb=sb,ub=Date.now||function(){return(new Date).getTime()},vb=Object.create||function(a){if(arguments.length>1)throw new Error("Second argument not supported");if("object"!=typeof a)throw new TypeError("Argument must be an object");return g.prototype=a,new g},wb=[],xb=i,yb=void 0,zb=1,Ab=2,Bb=new w,Cb=new w,Db=B;B.prototype._validateInput=function(a){return tb(a)},B.prototype._validationError=function(){return new Error("Array Methods must be provided an Array")},B.prototype._init=function(){this._result=new Array(this.length)},B.prototype._enumerate=function(){for(var a=this.length,b=this.promise,c=this._input,d=0;b._state===yb&&a>d;d++)this._eachEntry(c[d],d)},B.prototype._eachEntry=function(a,b){var c=this._instanceConstructor;f(a)?a.constructor===c&&a._state!==yb?(a._onError=null,this._settledAt(a._state,b,a._result)):this._willSettleAt(c.resolve(a),b):(this._remaining--,this._result[b]=this._makeResult(zb,b,a))},B.prototype._settledAt=function(a,b,c){var d=this.promise;d._state===yb&&(this._remaining--,this._abortOnReject&&a===Ab?t(d,c):this._result[b]=this._makeResult(a,b,c)),0===this._remaining&&s(d,this._result)},B.prototype._makeResult=function(a,b,c){return c},B.prototype._willSettleAt=function(a,b){var c=this;u(a,void 0,function(a){c._settledAt(zb,b,a)},function(a){c._settledAt(Ab,b,a)})};var Eb=C,Fb=D,Gb=E,Hb=F,Ib="rsvp_"+ub()+"-",Jb=0,Kb=I;I.cast=Gb,I.all=Eb,I.race=Fb,I.resolve=Gb,I.reject=Hb,I.prototype={constructor:I,_guidKey:Ib,_onError:function(a){rb.async(function(b){setTimeout(function(){b._onError&&rb.trigger("error",a)},0)},this)},then:function(a,b,c){var d=this,e=d._state;if(e===zb&&!a||e===Ab&&!b)return rb.instrument&&xb("chained",this,this),this;d._onError=null;var f=new this.constructor(k,c),g=d._result;if(rb.instrument&&xb("chained",d,f),e){var h=arguments[e-1];rb.async(function(){y(e,f,h,g)})}else u(d,f,a,b);return f},"catch":function(a,b){return this.then(null,a,b)},"finally":function(a,b){var c=this.constructor;return this.then(function(b){return c.resolve(a()).then(function(){return b})},function(b){return c.resolve(a()).then(function(){throw b})},b)}};var Lb=new J,Mb=new J,Nb=P,Ob=T;U.prototype=vb(Db.prototype),U.prototype._superConstructor=Db,U.prototype._makeResult=A,U.prototype._validationError=function(){return new Error("allSettled must be called with an array")};var Pb=V,Qb=W,Rb=X;X.prototype=vb(Db.prototype),X.prototype._superConstructor=Db,X.prototype._init=function(){this._result={}},X.prototype._validateInput=function(a){return a&&"object"==typeof a},X.prototype._validationError=function(){return new Error("Promise.hash must be called with an object")},X.prototype._enumerate=function(){var a=this.promise,b=this._input,c=[];for(var d in b)a._state===yb&&b.hasOwnProperty(d)&&c.push({position:d,entry:b[d]});var e=c.length;this._remaining=e;for(var f,g=0;a._state===yb&&e>g;g++)f=c[g],this._eachEntry(f.entry,f.position)};var Sb=Y;Z.prototype=vb(Rb.prototype),Z.prototype._superConstructor=Db,Z.prototype._makeResult=A,Z.prototype._validationError=function(){return new Error("hashSettled must be called with an object")};var Tb,Ub=$,Vb=_,Wb=ab,Xb=bb,Yb=cb,Zb=db,$b=eb,_b=0,ac=fb,bc="undefined"!=typeof window?window:void 0,cc=bc||{},dc=cc.MutationObserver||cc.WebKitMutationObserver,ec="undefined"!=typeof process&&"[object process]"==={}.toString.call(process),fc="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,gc=new Array(1e3);if(Tb=ec?gb():dc?ib():fc?jb():void 0===bc&&"function"==typeof require?mb():kb(),rb.async=ac,"undefined"!=typeof window&&"object"==typeof window.__PROMISE_INSTRUMENTATION__){var hc=window.__PROMISE_INSTRUMENTATION__;c("instrument",!0);for(var ic in hc)hc.hasOwnProperty(ic)&&ob(ic,hc[ic])}var jc={race:Qb,Promise:Kb,allSettled:Pb,hash:Sb,hashSettled:Ub,denodeify:Nb,on:ob,off:pb,map:Xb,filter:$b,resolve:Yb,reject:Zb,all:Ob,rethrow:Vb,defer:Wb,EventTarget:qb,configure:c,async:nb};"function"==typeof define&&define.amd?define(function(){return jc}):"undefined"!=typeof module&&module.exports?module.exports=jc:"undefined"!=typeof this&&(this.RSVP=jc)}).call(this),function(a,b){"use strict";var c=b.head||b.getElementsByTagName("head")[0],d="basket-",e=5e3,f=[],g=function(a,b){try{return localStorage.setItem(d+a,JSON.stringify(b)),!0}catch(c){if(c.name.toUpperCase().indexOf("QUOTA")>=0){var e,f=[];for(e in localStorage)0===e.indexOf(d)&&f.push(JSON.parse(localStorage[e]));return f.length?(f.sort(function(a,b){return a.stamp-b.stamp}),basket.remove(f[0].key),g(a,b)):void 0}return}},h=function(a){var b=new RSVP.Promise(function(b,c){var d=new XMLHttpRequest;d.open("GET",a),d.onreadystatechange=function(){4===d.readyState&&(200===d.status||0===d.status&&d.responseText?b({content:d.responseText,type:d.getResponseHeader("content-type")}):c(new Error(d.statusText)))},setTimeout(function(){d.readyState<4&&d.abort()},basket.timeout),d.send()});return b},i=function(a){return h(a.url).then(function(b){var c=j(a,b);return a.skipCache||g(a.key,c),c})},j=function(a,b){var c=+new Date;return a.data=b.content,a.originalType=b.type,a.type=a.type||b.type,a.skipCache=a.skipCache||!1,a.stamp=c,a.expire=c+60*(a.expire||e)*60*1e3,a},k=function(a,b){return!a||a.expire-+new Date<0||b.unique!==a.unique||basket.isValidItem&&!basket.isValidItem(a,b)},l=function(a){var b,c,d;if(a.url)return a.key=a.key||a.url,b=basket.get(a.key),a.execute=a.execute!==!1,d=k(b,a),a.live||d?(a.unique&&(a.url+=(a.url.indexOf("?")>0?"&":"?")+"basket-unique="+a.unique),c=i(a),a.live&&!d&&(c=c.then(function(a){return a},function(){return b}))):(b.type=a.type||b.originalType,b.execute=a.execute,c=new RSVP.Promise(function(a){a(b)})),c},m=function(a){var d=b.createElement("script");d.defer=!0,d.text=a.data,c.appendChild(d)},n={"default":m},o=function(a){return a.type&&n[a.type]?n[a.type](a):n["default"](a)},p=function(a){return a.map(function(a){return a.execute&&o(a),a})},q=function(){var a,b,c=[];for(a=0,b=arguments.length;b>a;a++)c.push(l(arguments[a]));return RSVP.all(c)},r=function(){var a=q.apply(null,arguments),b=this.then(function(){return a}).then(p);return b.thenRequire=r,b};a.basket={require:function(){for(var a=0,b=arguments.length;b>a;a++)arguments[a].execute=arguments[a].execute!==!1,arguments[a].once&&f.indexOf(arguments[a].url)>=0?arguments[a].execute=!1:arguments[a].execute!==!1&&f.indexOf(arguments[a].url)<0&&f.push(arguments[a].url);var c=q.apply(null,arguments).then(p);return c.thenRequire=r,c},remove:function(a){return localStorage.removeItem(d+a),this},get:function(a){var b=localStorage.getItem(d+a);try{return JSON.parse(b||"false")}catch(c){return!1}},clear:function(a){var b,c,e=+new Date;for(b in localStorage)c=b.split(d)[1],c&&(!a||this.get(c).expire<=e)&&this.remove(c);return this},isValidItem:null,timeout:5e3,addHandler:function(a,b){Array.isArray(a)||(a=[a]),a.forEach(function(a){n[a]=b})},removeHandler:function(a){basket.addHandler(a,void 0)}},basket.clear(!0)}(this,document);
//# sourceMappingURL=basket.full.min.js.map








