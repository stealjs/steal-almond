var stealTools = require("steal-tools");
var assert = require("assert");

var createGraphStream = stealTools.createGraphStream;
var multiBuild = stealTools.createMultiBuildStream;
var concat = stealTools.createConcatStream;
var write = stealTools.createWriteStream;

var almond = require("../main").createAlmondStream;
var through = require("through2");

var helpers = require("./helpers");
var open = helpers.open;
var find = helpers.find;

describe("createAlmondStream", function(){
	it("Works", function(done){
		var stream = createGraphStream({
			config: __dirname + "/tests/basics/package.json!npm"
		}, {
			minify: false,
			quiet: true,
			useNormalizedDependencies: true
		})
		.pipe(multiBuild())
		.pipe(almond())
		.pipe(concat())
		.pipe(write());


		stream.pipe(through.obj(function(){
			open("test/tests/basics/prod.html", function(browser, close){
				find(browser,"moduleValue", function(moduleValue){
					var msg = moduleValue();
					assert.equal(msg, "i am other and i have dep", "it worked");
					close();
				}, close);
			}, done);
		}));
	});
});
