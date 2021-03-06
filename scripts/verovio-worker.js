

self.methods = null;


/////////////////////////////
//
// WASM installation variable:
//

self.Module = {
	onRuntimeInitialized: function() {
			methods = new verovioCalls();
			methods.vrvToolkit = new verovio.toolkit();
			console.log(`Verovio ${methods.vrvToolkit.getVersion()} loaded: ${methods.vrvToolkit.initialized}`);

			postMessage({method: "ready"});
		// postMessage(["loaded", false, {}]);
	}
};

//
// WASM
//
//////////////////////////////

// importScripts("https://verovio-script.humdrum.org/scripts/verovio-toolkit-wasm.js");
importScripts("verovio-toolkit-enote.js");
importScripts("humdrumValidator.js");
importScripts("verovio-calls.js");


//////////////////////////////
//
// resolve --
//

function resolve(data, result) {
	postMessage({
		method: data.method,
		idx: data.idx,
		result: result,
		success: true
	});
};



//////////////////////////////
//
// reject --
//

function reject(data, result) {
	postMessage({
		method: data.method,
		idx: data.idx,
		result: result,
		success: false
	});
};


//////////////////////////////
//
// message event listener --
//

addEventListener("message", function(oEvent) {
	try {
		resolve(oEvent.data, methods[oEvent.data.method].apply(methods, oEvent.data.args));
	} catch(err) {
		reject(oEvent.data, err);
	}
});


// non-wasm:
// methods = new verovioCalls();
// methods.vrvToolkit = new verovio.toolkit();
// postMessage({method: "ready"});




