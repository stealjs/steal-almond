"format cjs";

var other = require("./other");
window.moduleValue = other;

var child = document.createElement("div");
child.textContent = "hello world";
document.body.appendChild(child);
