var can = require("can");
var template = require("./view.stache");

var map = new can.Map({
	show: true
});
var frag = template(map);

can.$("body").append(frag);
