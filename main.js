var through = require("through2");
var almondPath = require.resolve("almond");
var makeNode = require("steal-tools/lib/node/make_node");
var fs = require("fs");
var asap = require("pdenodeify");

exports = module.exports = createBuild;

exports.createStream = function(){
	return through.obj(addAlmond);
};

function addAlmond(data, enc, next){
	var bundles = data.bundles;

	// TODO check if there are more than 1 bundle and throw

	var configMain = data.steal.System.configMain;
	var main = data.steal.System.main;

	var toKeep = walk(data.graph, main);
	var bundle = bundles[0];

	// Should find a more efficient way

	bundle.nodes.forEach(function(node, i){
		node.load.excludeFromBuild = !toKeep[node.load.name];
	});

	var hasGlobal = bundle.nodes.some(isGlobal);

	var globalPromise = Promise.resolve();
	if(hasGlobal){
		globalPromise = asap(fs.readFile)(__dirname+"/loader_shim.js", "utf8")
			.then(function(src){
				bundle.nodes.unshift(makeNode("[@loader]", src));
			});
	}

	globalPromise.then(function(){
		return asap(fs.readFile)(almondPath, "utf8");
	})
	.then(function(src){
		bundle.nodes.unshift(makeNode("[almond]", src));
		bundle.nodes.push(makeNode("[require-main]", "require([\"" + main +
								   "\"]);\n"));
		bundle.nodes.unshift(makeNode("[iife-start]", "(function(){\n"));
		bundle.nodes.push(makeNode("[iife-end]", "\n})();\n"));

		next(null, data);
	}, function(err){
		next(err);
	});
}

function walk(graph, name, keep, visited){
	keep = keep || {};
	visited = visited || {};
	keep[name] = true;
	visited[name] = true;

	var node = graph[name];
	var deps = node.load.metadata.dependencies || [];

	deps.forEach(function(name){
		if(!visited[name])
			walk(graph, name, keep, visited);
	});

	return keep;
}

function isGlobal(node){
	return node.load.metadata && node.load.metadata.format === "global";
}

function createBuild(stealTools){
	var s = stealTools.streams;
	var almond = exports.createStream;

	return function(system, options){
		return new Promise(function(resolve, reject){
			options = options || {};
			options.useNormalizedDependencies = true;

			var stream = s.graph(system, options)
			.pipe(s.transpileAndBundle())
			.pipe(almond())
			.pipe(s.concat());

			if(options.minify !== false) {
				stream = stream.pipe(minify(options));
			}

			stream = stream.pipe(s.write());

			stream.on("data", function(data){
				this.end();
				resolve(data);
			});

			stream.on("error", function(err){
				reject(err);
			});

		});
	};
}

// TODO this should be a separate package
function minify(options){
	var UglifyJS = require("uglify-js");

	//var result = UglifyJS.minify(code, opts)

	return through.obj(function(data, enc, next){
		var bundle = data.bundles[0];
		var source = bundle.source;

		var opts = { fromString: true };
		if(source.map) {
			var inMap = source.map.toJSON();
			var file = inMap.sources && inMap.sources[0];
			opts.inSourceMap = inMap;
			opts.outSourceMap = file;

			if(options.sourceMapsContent) {
				opts.sourceMapIncludeSources = true;
			}
		}

		try {
			var result = UglifyJS.minify(source.code, opts);
			result.code = removeSourceMapUrl(result.code);

			bundle.source = result;
			next(null, data);
		} catch(err) {
			next(err);
		}

	});
}

function removeSourceMapUrl(source){
	var expression = /\n\/\/# sourceMappingURL=(.)+$/;
	return (source || "").replace(expression, "");
}
