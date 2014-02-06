var coerce = require('../util/coerce').coerce;

/**
 *  Coerces unparsed arguments.
 *
 *  The resulting array is then assigned to the program
 *  for easy access.
 */
module.exports = function() {
  return function unparsed(req, next) {
    var args = req.result.unparsed.slice(0);
    for(var i =0;i < args.length;i++) {
      args[i] = coerce.call(this, this, args[i]);
    }
    this.args = args;
    next();
  }
}
