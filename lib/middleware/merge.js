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
  var k, v, arg, re = /^no/;
  for(k in target) {
    arg = this._arguments[k];
    if(arg) {
      v = target[k];
      if(arg.multiple() && !Array.isArray(v)) {
        v = [v];
      }else if(!arg.multiple() && Array.isArray(v)) {
        raise.call(this, errors.EMULTIPLE,
          [arg.names().join(' | '), v.join(', ')], {arg: arg, value: v});
      }
      v = coerce.call(this, arg, v);
      assign.call(this, arg, k, v);
    }else{
      // TODO: handle unknown option here?
    }
  }
  return true;
}

module.exports = function() {
  return function merge(req, next) {
    req.result.values = {};
    try {
      set.call(this, req.result.all);
    }catch(e) {
      return next(e);
    }
    next();
  }
}
