var coerce = require('../util/coerce').coerce;
var assign = require('../util/assign');

/**
 *  Set parsed arguments as properties of the program or stash
 *  if a stash is configured.
 *
 *  @param target The target object encapsulated by
 *  the argument parsing result object.
 */
function set(target) {
  var receiver = this.getReceiver();
  var k, v, arg;
  for(k in target) {
    arg = this._arguments[k];
    if(arg) {
      v = target[k];
      if(arg.multiple() && !Array.isArray(v)) {
        v = [v];
      }
      v = coerce.call(this, arg, v);
      assign.call(this, arg, k, v);
    }
  }
  return true;
}

module.exports = function() {
  return function merge(req, next) {
    if(!arguments.length) return;
    req.result.values = {};
    try {
      set.call(this, req.result.all);
    }catch(e) {
      return next(e);
    }
    next();
  }
}
