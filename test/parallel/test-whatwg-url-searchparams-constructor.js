'use strict';

require('../common');
const assert = require('assert');
const URLSearchParams = require('url').URLSearchParams;

let params;

// Basic URLSearchParams construction
params = new URLSearchParams();
assert.strictEqual(params + '', '');
params = new URLSearchParams('');
assert.strictEqual(params + '', '');
params = new URLSearchParams('a=b');
assert.strictEqual(params + '', 'a=b');
params = new URLSearchParams(params);
assert.strictEqual(params + '', 'a=b');

// URLSearchParams constructor, no arguments
params = new URLSearchParams();
assert.strictEqual(params.toString(), '');

assert.throws(() => URLSearchParams(), TypeError,
              'Calling \'URLSearchParams\' without \'new\' should throw.');

// URLSearchParams constructor, undefined and null as argument
params = new URLSearchParams(undefined);
assert.strictEqual(params.toString(), '');
params = new URLSearchParams(null);
assert.strictEqual(params.toString(), '');

// URLSearchParams constructor, empty string as argument
params = new URLSearchParams('');
// eslint-disable-next-line no-restricted-properties
assert.notEqual(params, null, 'constructor returned non-null value.');
// eslint-disable-next-line no-proto
assert.strictEqual(params.__proto__, URLSearchParams.prototype,
                   'expected URLSearchParams.prototype as prototype.');

// URLSearchParams constructor, {} as argument
params = new URLSearchParams({});
assert.strictEqual(params + '', '');

// URLSearchParams constructor, string.
params = new URLSearchParams('a=b');
assert.notStrictEqual(params, null, 'constructor returned non-null value.');
assert.strictEqual(true, params.has('a'),
                   'Search params object has name "a"');
assert.strictEqual(false, params.has('b'),
                   'Search params object has not got name "b"');
params = new URLSearchParams('a=b&c');
assert.notStrictEqual(params, null, 'constructor returned non-null value.');
assert.strictEqual(true, params.has('a'),
                   'Search params object has name "a"');
assert.strictEqual(true, params.has('c'),
                   'Search params object has name "c"');
params = new URLSearchParams('&a&&& &&&&&a+b=& c&m%c3%b8%c3%b8');
assert.notStrictEqual(params, null, 'constructor returned non-null value.');
assert.strictEqual(true, params.has('a'), 'Search params object has name "a"');
assert.strictEqual(true, params.has('a b'),
                   'Search params object has name "a b"');
assert.strictEqual(true, params.has(' '),
                   'Search params object has name " "');
assert.strictEqual(false, params.has('c'),
                   'Search params object did not have the name "c"');
assert.strictEqual(true, params.has(' c'),
                   'Search params object has name " c"');
assert.strictEqual(true, params.has('møø'),
                   'Search params object has name "møø"');

// URLSearchParams constructor, object.
const seed = new URLSearchParams('a=b&c=d');
params = new URLSearchParams(seed);
assert.notStrictEqual(params, null, 'constructor returned non-null value.');
assert.strictEqual(params.get('a'), 'b');
assert.strictEqual(params.get('c'), 'd');
assert.strictEqual(false, params.has('d'));
// The name-value pairs are copied when created; later updates
// should not be observable.
seed.append('e', 'f');
assert.strictEqual(false, params.has('e'));
params.append('g', 'h');
assert.strictEqual(false, seed.has('g'));

// Parse +
params = new URLSearchParams('a=b+c');
assert.strictEqual(params.get('a'), 'b c');
params = new URLSearchParams('a+b=c');
assert.strictEqual(params.get('a b'), 'c');

// Parse space
params = new URLSearchParams('a=b c');
assert.strictEqual(params.get('a'), 'b c');
params = new URLSearchParams('a b=c');
assert.strictEqual(params.get('a b'), 'c');

// Parse %20
params = new URLSearchParams('a=b%20c');
assert.strictEqual(params.get('a'), 'b c');
params = new URLSearchParams('a%20b=c');
assert.strictEqual(params.get('a b'), 'c');

// Parse \0
params = new URLSearchParams('a=b\0c');
assert.strictEqual(params.get('a'), 'b\0c');
params = new URLSearchParams('a\0b=c');
assert.strictEqual(params.get('a\0b'), 'c');

// Parse %00
params = new URLSearchParams('a=b%00c');
assert.strictEqual(params.get('a'), 'b\0c');
params = new URLSearchParams('a%00b=c');
assert.strictEqual(params.get('a\0b'), 'c');

// Parse \u2384 (Unicode Character 'COMPOSITION SYMBOL' (U+2384))
params = new URLSearchParams('a=b\u2384');
assert.strictEqual(params.get('a'), 'b\u2384');
params = new URLSearchParams('a\u2384b=c');
assert.strictEqual(params.get('a\u2384b'), 'c');

// Parse %e2%8e%84 (Unicode Character 'COMPOSITION SYMBOL' (U+2384))
params = new URLSearchParams('a=b%e2%8e%84');
assert.strictEqual(params.get('a'), 'b\u2384');
params = new URLSearchParams('a%e2%8e%84b=c');
assert.strictEqual(params.get('a\u2384b'), 'c');

// Parse \uD83D\uDCA9 (Unicode Character 'PILE OF POO' (U+1F4A9))
params = new URLSearchParams('a=b\uD83D\uDCA9c');
assert.strictEqual(params.get('a'), 'b\uD83D\uDCA9c');
params = new URLSearchParams('a\uD83D\uDCA9b=c');
assert.strictEqual(params.get('a\uD83D\uDCA9b'), 'c');

// Parse %f0%9f%92%a9 (Unicode Character 'PILE OF POO' (U+1F4A9))
params = new URLSearchParams('a=b%f0%9f%92%a9c');
assert.strictEqual(params.get('a'), 'b\uD83D\uDCA9c');
params = new URLSearchParams('a%f0%9f%92%a9b=c');
assert.strictEqual(params.get('a\uD83D\uDCA9b'), 'c');

// Constructor with sequence of sequences of strings
params = new URLSearchParams([]);
// eslint-disable-next-line no-restricted-properties
assert.notEqual(params, null, 'constructor returned non-null value.');
params = new URLSearchParams([['a', 'b'], ['c', 'd']]);
assert.strictEqual(params.get('a'), 'b');
assert.strictEqual(params.get('c'), 'd');
assert.throws(() => new URLSearchParams([[1]]),
              /^TypeError: Each query pair must be a name\/value tuple$/);
assert.throws(() => new URLSearchParams([[1, 2, 3]]),
              /^TypeError: Each query pair must be a name\/value tuple$/);

[
  // Further confirmation needed
  // https://github.com/w3c/web-platform-tests/pull/4523#discussion_r98337513
  // {
  //   input: {'+': '%C2'},
  //   output: [[' ', '\uFFFD']],
  //   name: 'object with +'
  // },
  {
    input: {c: 'x', a: '?'},
    output: [['c', 'x'], ['a', '?']],
    name: 'object with two keys'
  },
  {
    input: [['c', 'x'], ['a', '?']],
    output: [['c', 'x'], ['a', '?']],
    name: 'array with two keys'
  }
].forEach((val) => {
  const params = new URLSearchParams(val.input);
  assert.deepStrictEqual(Array.from(params), val.output,
                         `Construct with ${val.name}`);
});

// Custom [Symbol.iterator]
params = new URLSearchParams();
params[Symbol.iterator] = function *() {
  yield ['a', 'b'];
};
const params2 = new URLSearchParams(params);
assert.strictEqual(params2.get('a'), 'b');

assert.throws(() => new URLSearchParams({ [Symbol.iterator]: 42 }),
              /^TypeError: Query pairs must be iterable$/);
assert.throws(() => new URLSearchParams([{}]),
              /^TypeError: Each query pair must be iterable$/);
assert.throws(() => new URLSearchParams(['a']),
              /^TypeError: Each query pair must be iterable$/);
assert.throws(() => new URLSearchParams([{ [Symbol.iterator]: 42 }]),
              /^TypeError: Each query pair must be iterable$/);
