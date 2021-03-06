//
// reference: https://github.com/rism-ch/verovio/blob/gh-pages/mei-viewer.xhtml
// vim: ts=3

LASTLINE = -1;

//////////////////////////////
//
// play_midi --
//

var DELAY = 600;

function play_midi(starttime) {
	starttime = starttime ? starttime : 0;
	if (starttime == 0) {
		DELAY = 600;
	} else {
		DELAY = 600;
	}

	vrvWorker.renderToMidi()
	.then(function (base64midi) {
		var song = 'data:audio/midi;base64,' + base64midi;
		$("#play-button").hide();
		$("#midiPlayer_play").show();
		$("#midiPlayer_stop").show();
		$("#midiPlayer_pause").show();
		$("#player").show();
		$("#player").midiPlayer.play(song, starttime);
		PLAY = true;
		LASTLINE = -1;
	});
}




//////////////////////////////
//
// midiUpdate --
//

var ids = [];
var midiUpdate = function (time) {

	var vrvTime = Math.max(0, time - DELAY);
	vrvWorker.getElementsAtTime(vrvTime)
	.then(function (elementsattime) {
		var matches;
		if (elementsattime.page > 0) {
			if (elementsattime.page != vrvWorker.page) {
				vrvWorker.page = elementsattime.page;
				loadPage();
			}
			if ((elementsattime.notes.length > 0) && (ids != elementsattime.notes)) {
				ids.forEach(function (noteid) {
						if ($.inArray(noteid, elementsattime.notes) == -1) {
						// $("#" + noteid ).attr("fill", "#000");
						// $("#" + noteid ).attr("stroke", "#000");
						// $("#" + noteid ).removeClassSVG("highlight");

						var element = document.querySelector("#" + noteid);
						if (element) {
							element.classList.remove("highlight");
						}

					}
				});
				ids = elementsattime.notes;
				// for (var i=0; i<ids.length; i++) {
				// 	if (matches = ids[i].match(/-L(\d+)/)) {
				// 		var line = matches[1];
				// 		if (line != LASTLINE) {
				// 			showIdInEditor(ids[i]);
				// 			LASTLINE = line;
				// 		}
				// 	}
				// }
				var scrollParent = document.querySelector("#output"),
						parentRect = scrollParent.getBoundingClientRect(),
						scrolled = false,
						margin = 1/3;
				ids.forEach(function (noteid) {
						// console.log("NoteID", noteid);

						if (matches = noteid.match(/-L(\d+)/)) {
							var line = parseInt(matches[1]);
							// console.log("LASTLINE = ", LASTLINE, "line =", line);
							if ((line != LASTLINE) && (line > LASTLINE)) {
								showIdInEditor(noteid);
								LASTLINE = line;
							}
						}

						// $("#" + noteid ).attr("fill", "#c00");
						// $("#" + noteid ).attr("stroke", "#c00");;
						// $("#" + noteid ).addClassSVG("highlight");

						var element = document.querySelector("#" + noteid);
						if (element) {
							element.classList.add("highlight");
							/*
							var classes = element.getAttribute("class");
							var classlist = classes.split(" ");
							var outclass = "";
							for (var i=0; i<classlist.length; i++) {
								if (classlist[i] == "highlight") {
									continue;
								}
								outclass += " " + classlist[i];
							}
							outclass += " highlight";
							element.setAttribute("class", outclass);*/
							if (!scrolled) {
								var system = element.closest(".system"),
										rect;
								if (system) {
										rect = system.getBoundingClientRect();
										if (rect.top < parentRect.top) {
											scrollParent.scrollTop = scrollParent.scrollTop - (parentRect.top - rect.top) - rect.height * margin;
											scrolled = true;
										} else if (rect.bottom  > parentRect.bottom) {
											scrollParent.scrollTop = scrollParent.scrollTop + (rect.bottom - parentRect.bottom) + rect.height * margin;
											scrolled = true;
										};
								};
							};
						}

				});
			}
		}
	});
}




//////////////////////////////
//
// midiStop -- Callback for WildWestMidi when stopping MIDI playback.
//

var midiStop = function () {
	ids.forEach(function (noteid) {
		// $("#" + noteid ).attr("fill", "#000");
		// $("#" + noteid ).attr("stroke", "#000");
		// .removeClassSVG is not working:
		// $("#" + noteid ).removeClassSVG("highlight");

		var element = document.querySelector("#" + noteid);
		if (element) {
			var classes = element.getAttribute("class");
			var classlist = classes.split(" ");
			var outclass = "";
			for (var i=0; i<classlist.length; i++) {
				if (classlist[i] == "highlight") {
					continue;
				}
				outclass += " " + classlist[i];
			}
			element.setAttribute("class", outclass);
		}
	});
	$("#player").hide();
	$("#play-button").show();
	CursorNote = null;
	PLAY = false;
   LASTLINE = -1;
}



$.fn.addClassSVG = function (className) {
	$(this).attr('class', function (index, existingClassNames) {
		return existingClassNames + ' ' + className;
	});
	return this;
};


$.fn.removeClassSVG = function (className){
	$(this).attr('class', function (index, existingClassNames) {
		//var re = new RegExp(className, 'g');
		//return existingClassNames.replace(re, '');
	});
	return this;
};


