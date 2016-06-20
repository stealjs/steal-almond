var copy = require("copy-dir").sync;

var modules = [
	"can",
	"can-simple-dom",
	"micro-location",
	"simple-html-tokenizer",
	"jquery"
];

modules.forEach(function(name){
	try {
		copy("node_modules/" + name, "test/tests/canjs/node_modules/" + name);
	} catch(err) {
		// In NPM 2 it will throw for modules which are nested, we can ignore
	}
});
