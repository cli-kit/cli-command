/**
 *  Validates that options that have not been marked explicitly
 *  as acceptable multiple values are not declared multiple times
 *  in the argument list.
 */
module.exports = function() {
  return function emultiple(req, next) {
    var k, v, arg;
    for(k in req.result.options) {
      arg = this._options[k];
      if(arg) {
        v = req.result.options[k];
        if(!arg.multiple() && Array.isArray(v)) {
          return next(this.errors.EMULTIPLE, [arg.toString(null), v.join(', ')]);
        }
      }
    }
    next();
  }
}
