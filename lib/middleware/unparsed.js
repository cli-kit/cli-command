var coerce = require('../util/coerce').coerce;

/**
 *  Coerces unparsed arguments.
 *
 *  The resulting array is then assigned to the request
 *  for easy access.
 */
module.exports = function() {
  return function unparsed(req, next) {
    if(!arguments.length) return;
    var conf = this.configure();
    var args = req.result.unparsed.slice(0), v, i = 0, j = 0;
    req.unparsed = args.slice(0);
    if(conf.strict) return next();
    for(i = 0;i < args.length;i++, j++) {
      try {
        v = coerce.call(this, this, args[i], i);
        req.unparsed.splice(j, 1);
        args[i] = v;
        j--;
      }catch(e) {
        return next(e);
      }
    }
    req.args = args;
    next();
  }
}
