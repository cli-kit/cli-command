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
    var receiver = this.configure().stash;
    var k, v, arg;
    //console.dir(req.result);
    for(k in req.result.all) {
      arg = this._arguments[k];
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
