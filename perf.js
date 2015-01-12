var start = process.hrtime();

var cli = require('./');

var diff = process.hrtime(start);
console.log('requires took %d microseconds',
  (diff[0] * 1e9 + diff[1]) / 1000);

console.dir(Object.keys(require.cache));
