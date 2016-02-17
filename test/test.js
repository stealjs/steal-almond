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
		}, { minify: false, quiet: true })
		.pipe(multiBuild())
		.pipe(almond())
		.pipe(concat())
		.pipe(write());


		stream.pipe(through.obj(function(){
			console.log("it's done");

			open("test/tests/basics/prod.html", function(browser, close){
				find(browser,"moduleValue", function(moduleValue){
					assert.equal(moduleValue, "works", "it worked");
					close();
				}, close);
			}, done);
		}));
	});
});
