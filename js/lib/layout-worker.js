self.importScripts("viz.js");

self.onmessage = function(e) {
    self.postMessage(Viz(e.data[0], { engine: e.data[1], format: "plain" }));
};
