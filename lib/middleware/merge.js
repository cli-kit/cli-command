var assign = require('../util/assign');

module.exports = function() {
  return function merge(req, next) {
    if(!arguments.length) return;
    var k, v, arg;
    for(k in req.result.all) {
      arg = this._arguments[k];
      if(arg) {
        v = req.result.all[k];
        if(arg.multiple() && !Array.isArray(v)) {
          v = [v];
        }
        //console.log('merge assign: %s=%s', k, v);
        assign.call(this, arg, k, v);
        //console.log('after merge %s', this[k]);
      }
    }
    next();
  }
}
