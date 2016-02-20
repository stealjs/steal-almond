"format cjs";

var other = require("./other");
var global = require("./global");
window.moduleValue = {
	global: global,
	other: other
};

var child = document.createElement("div");
child.textContent = "hello world";
document.body.appendChild(child);
