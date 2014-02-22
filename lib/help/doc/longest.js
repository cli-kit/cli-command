module.exports = function longest(target, max) {
  var mx = max || 0, z;
  target.forEach(function(str) {
    mx = Math.max(mx, str.length);
  })
  return mx;
}

