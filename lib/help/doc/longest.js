// NOTE: this function is no longer in use but
// NOTE: had been kept in the code base in case
// NOTE: the logic needs to be re-instated
module.exports = function longest(target, max) {
  var mx = max || 0, z;
  target.forEach(function(str) {
    mx = Math.max(mx, str.length);
  })
  return mx;
}

