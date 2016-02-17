var through = require("through2");
var almondPath = require.resolve("almond");
var makeNode = require("steal-tools/lib/node/make_node");
var fs = require("fs");

exports = module.exports = createBuild;

exports.createAlmondStream = function(){
	return through.obj(addAlmond);
};

function addAlmond(data, enc, next){
	var bundles = data.bundles;
	var configMain = data.steal.System.configMain;
	var main = data.steal.System.main;

	var toKeep = walk(data.graph, main);

	bundles.forEach(function(bundle){
		// Should find a more efficient way

		var toRemove = [];
		bundle.nodes.forEach(function(node, i){
			if(!toKeep[node.load.name]) toRemove.push(i);
		});

		var offset = 0;
		toRemove.sort();
		toRemove.forEach(function(i){
			i = i - offset;
			bundle.nodes.splice(i, 1);
			offset++;
		});
	});

	fs.readFile(almondPath, "utf8", function(err, src){
		if(err) return next(err);

		var bundle = bundles[0];
		bundle.nodes.unshift(makeNode("[almond]", src));
		bundle.nodes.push(makeNode("[require]", "require([\"" + main + "\"]);\n"));
		bundle.nodes.unshift(makeNode("[iife-start]", "(function(){\n"));
		bundle.nodes.push(makeNode("[iife-end]", "\n})();\n"));

		next(null, data);
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

function merge(obj, arr){
	arr.forEach(function(key){
		obj[key] = true;
	});
}

function createBuild(stealTools){
	var createGraphStream = stealTools.createGraphStream;
	var multiBuild = stealTools.createMultiBuildStream;
	var concat = stealTools.createConcatStream;
	var write = stealTools.createWriteStream;
	var almond = exports.createAlmondStream;

	return function(system, options){
		return new Promise(function(resolve, reject){
			options = options || {};
			options.useNormalizedDependencies = true;

			var stream = createGraphStream(system, options)
			.pipe(multiBuild())
			.pipe(almond())
			.pipe(concat())
			.pipe(write());

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
