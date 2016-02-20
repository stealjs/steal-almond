
**Note** This is a WIP project based on a future version of steal-tools. Not ready to use yet.

# steal-almond

[![Build Status](https://travis-ci.org/stealjs/steal-almond.svg?branch=master)](https://travis-ci.org/stealjs/steal-almond)
[![npm version](https://badge.fury.io/js/steal-almond.svg)](http://badge.fury.io/js/steal-almond)


Create builds of your StealJS that use packs [almond](https://github.com/jrburke/almond) so that Steal is not needed in production.

## Install

```js
npm install steal-almond --save-dev
```

## Use

Use `steal-almond` in place of where you would normally use `steal-tools`:

```js
var stealTools = require("steal-tools");
var multiBuild = require("steal-almond")(stealTools);

multiBuild({
	config: __dirname + "/package.json!npm"
});
```

### Streams

steal-almond builds on the steal-tools streaming APIs. If you are using these you can use steal-almond too:

```js
var s = require("steal-tools").streams;
var stealTools = require("steal-tools");
var assert = require("assert");

var almond = require("steal-almond").createStream;

var stream = s.graph({
	config: __dirname + "/tests/basics/package.json!npm"
}, { minify: false, quiet: true })
.pipe(s.transpileAndBundle())
.pipe(almond())
.pipe(s.concat())
.pipe(s.write());
```

## License

MIT
