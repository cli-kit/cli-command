/**
 *  Validates that options that have not been marked explicitly
 *  as acceptable multiple values are not declared multiple times
 *  in the argument list.
 */
module.exports = function() {
  return function emultiple(req, next) {
    if(!arguments.length) return;
    var k, v, arg;
    for(k in req.result.all) {
      arg = this._arguments[k];
      if(arg) {
        v = req.result.all[k];
        if(!arg.multiple() && Array.isArray(v)) {
          return next(this.errors.EMULTIPLE,
            [arg.names().join(' | '), v.join(', ')]);
        }
      }
    }
    next();
  }
}
