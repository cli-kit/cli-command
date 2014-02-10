var coerce = require('../util/coerce').coerce;
var assign = require('../util/assign');

/**
 *  Converts an option value using a type converter
 *  associated with the option.
 *
 *  Should be specified after the merge middleware.
 */
module.exports = function() {
  return function convert(req, next) {
    if(!arguments.length) return;
    var k, v, arg;
    for(k in req.result.all) {
      arg = this._options[k];
      v = arg.value();
      try {
        v = coerce.call(this, arg, v);
        assign.call(this, arg, k, v);
      }catch(e) {
        return next(e);
      }
    }
    next();
  }
}
