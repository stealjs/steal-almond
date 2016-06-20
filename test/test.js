var s = require("steal-tools").streams;
var stealTools = require("steal-tools");
var assert = require("assert");

var stealAlmond = require("../main")(stealTools);
var almond = require("../main").createStream;
var fs = require("fs");
var through = require("through2");
var asap = require("pdenodeify");
var rmdir = asap(require("rimraf"));

var helpers = require("./helpers");
var open = helpers.open;
var find = helpers.find;

describe("steal-almond", function(){
	beforeEach(function(done){
		rmdir(__dirname+"/tests/basics/dist").then(done);
	});

	it("Works", function(done){
		var p = stealAlmond({
			config: __dirname + "/tests/basics/package.json!npm"
		}, {
			minify: false,
			quiet: true
		});

		p.then(function(){
			open("test/tests/basics/prod.html", function(browser, close){
				find(browser,"moduleValue", function(moduleValue){
					var msg = moduleValue.other();
					var glbl = moduleValue.global;
					assert.equal(msg, "i am other and i have dep", "it worked");
					assert.equal(glbl, "global", "got a global");
					close();
				}, close);
			}, done);
		});
	});

	it("Minifies by default", function(done){
		var p = stealAlmond({
			config: __dirname + "/tests/basics/package.json!npm"
		}, {
			quiet: true
		});

		p.then(function(){
			open("test/tests/basics/prod.html", function(browser, close){
				find(browser,"moduleValue", function(moduleValue){
					var msg = moduleValue.other();
					var glbl = moduleValue.global;
					assert.equal(msg, "i am other and i have dep", "it worked");
					assert.equal(glbl, "global", "got a global");

					var source = fs.readFileSync(__dirname +
												 "/tests/basics/dist/bundles/main.js",
									"utf8");
					assert(!/\[almond\]/.test(source), "comments stripped out");

					close();
				}, close);
			}, done);
		});
	});

	it.only("Works with a can app", function(done){
		var p = stealAlmond({
			config: __dirname + "/tests/canjs/package.json!npm"
		}, {
			minify: false,
			quiet: true
		});

		p.then(function(){
			open("test/tests/canjs/prod.html", function(browser, close){
				find(browser,"moduleValue", function(moduleValue){
					var msg = moduleValue.other();
					var glbl = moduleValue.global;
					assert.equal(msg, "i am other and i have dep", "it worked");
					assert.equal(glbl, "global", "got a global");
					close();
				}, close);
			}, done);
		});
	});
});

describe("createStream", function(){
	beforeEach(function(done){
		rmdir(__dirname+"/tests/basics/dist").then(done);
	});

	it("Works", function(done){
		var stream = s.graph({
			config: __dirname + "/tests/basics/package.json!npm"
		}, {
			quiet: true,
			useNormalizedDependencies: true
		})
		.pipe(s.transpile())
		.pipe(s.minify())
		.pipe(s.bundle())
		.pipe(almond())
		.pipe(s.concat())
		.pipe(s.write());


		stream.pipe(through.obj(function(){
			open("test/tests/basics/prod.html", function(browser, close){
				find(browser,"moduleValue", function(moduleValue){
					var msg = moduleValue.other();
					var glbl = moduleValue.global;
					assert.equal(msg, "i am other and i have dep", "it worked");
					assert.equal(glbl, "global", "got a global");
					close();
				}, close);
			}, done);
		}));
	});
});
