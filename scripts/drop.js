//
// Programmer:     Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date:  Mon Jun 27 04:31:26 PDT 2016
// Last Modified:  Mon Jun 27 04:31:29 PDT 2016
// Filename:       drop.js
// Web Address:    https://verovio.humdrum.org/scripts/drop.js
// Syntax:         JavaScript 1.8/ECMAScript 5
// vim:            ts=3: ft=javascript
//
// Description:   Event listeners for drag/drop of Humdum files onto page.
//

var DROPAREA = "";

function setupDropArea(target) {
	if (!target) {
	  target = "#dropArea";
	}
	var droparea = document.querySelector(target);
	DROPAREA = droparea;

	window.addEventListener('dragenter', function(event) {
		showDropArea();
	});

	droparea.addEventListener('dragenter', allowDrag);
	droparea.addEventListener('dragover', allowDrag);
	droparea.addEventListener('dragleave', function(event) {
		hideDropArea();
	});
	droparea.addEventListener('drop', handleDrop);
}


function showDropArea(droparea) {
	if (!droparea) {
	  droparea = DROPAREA;
	}
	droparea.style.visibility = "visible";
}

function hideDropArea(droparea) {
	if (!droparea) {
	  droparea = DROPAREA;
	}
	droparea.style.visibility = "hidden";
}

function allowDrag(event) {
	if (true) {  // Test that the item being dragged is a valid one
		event.dataTransfer.dropEffect = 'copy';
		event.preventDefault();
	}
}

function handleDrop(event) {
	event.preventDefault();

	$('html').css('cursor', 'wait');
	hideDropArea();
	var file;
	var files = event.dataTransfer.files;
	for (var i=0; i<files.length; i++) {
		file = files[i];
		// console.log("NAME", escape(file.name));
		// console.log("SIZE", file.size);
		// console.log("DATE", file.lastModifiedDate.toLocaleDateString());

		var reader = new FileReader();

		reader.onload = function (event) {
			var contents = reader.result;
			replaceEditorContentWithHumdrumFile(contents, 1, file.name);
		};

		// reader.readAsDataURL(file); // loads MIME64 version of file
		// reader.readAsBinaryString(file);
		// file has to be read as Text with UTF-8 encoding
		// in order that files with UTF-8 characters are read
		// properly:
		reader.readAsText(file, 'UTF-8');
		break;   // only reading the first file if more than one.
	}
}


