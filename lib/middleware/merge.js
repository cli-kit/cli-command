var coerce = require('../util/coerce').coerce;
var assign = require('../util/assign');

/**
 *  Merge parsed arguments into the program.
 *
 *  @param target The target object encapsulated by
 *  the argument parsing result object.
 *  @param options An object that will receive the arguments
 *  being merged.
 */
function merge(target, options) {
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
      assign.call(this, arg, k, v, options);
    }else{
      // TODO: handle unknown option here?
    }
  }
  return true;
}

module.exports = function() {
  return function(req, next) {
    req.result.values = {};
    merge.call(this, req.result.all, req.result.values);
    next();
  }
}
