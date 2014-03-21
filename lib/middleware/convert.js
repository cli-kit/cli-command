var coerce = require('../util/coerce').coerce;
var assign = require('../util/assign');
var find = require('../util/find');

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
      //arg = this._options[k];
      arg = find.call(this, k);
      if(arg) {
        v = arg.value();
        try {
          v = coerce.call(this, arg, v);
          assign.call(this, arg, k, v);
        }catch(e) {
          return next(e);
        }
      }
    }
    next();
  }
}
