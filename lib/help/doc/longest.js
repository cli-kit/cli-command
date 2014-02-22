module.exports = function longest(target, max) {
  var mx = max || 0, z;
  if(Array.isArray(target)) {
    target.forEach(function(str) {
      mx = Math.max(mx, str.length);
    })
  // legacy support
  }else{
    for(z in target) {
      mx = Math.max(mx, target[z].name().length);
    }
  }
  return mx;
}

