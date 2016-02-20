__almondEval = function(src){
	eval(src);
};

define('@loader', [], function(){
	var glbl = window;
	var loop = function(cb){
		var has = Object.prototype.hasOwnProperty;
		for(var p in glbl){
			if(has.call(glbl, p))
				if(cb(p) === false)
					break;
		}
	};
	var helpers = {
		prepareGlobal: function(id){
			var o = this.o = {define:true,module:true,exports:true};
			loop(function(p){
				o[p] = true;
			});
		},
		retrieveGlobal: function(id){
			var value;
			var o = this.o;
			loop(function(p){
				if(!o[p]){
					value = glbl[p];
					return false;
				}
			});
			this.o = undefined;
			return value;
		}
	};

	return {
		get: function(){ return helpers; },
		global: glbl,
		__exec: function(obj){
			var source = obj.source;
			__almondEval(source);
		}
	};
});
