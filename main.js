var through = require("through2");
var almondPath = require.resolve("almond");
var makeNode = require("steal-tools/lib/node/make_node");
var fs = require("fs");

exports.createAlmondStream = function(){
	return through.obj(addAlmond);
};

function addAlmond(data, enc, next){
	var bundles = data.bundles;
	var configMain = data.steal.System.configMain;
	var main = data.steal.System.main;

	bundles.forEach(function(bundle){
		var toKeep = {};
		merge(toKeep, bundle.bundles);

		// Should find a more efficient way

		bundle.nodes.forEach(function(node){
			if(toKeep[node.load.name]) {
				merge(toKeep, node.load.metadata.dependencies);
			}
		});

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

function merge(obj, arr){
	arr.forEach(function(key){
		obj[key] = true;
	});
}

exports.createBuild = function(stealTools){

	return function(system, options){

	};
};
