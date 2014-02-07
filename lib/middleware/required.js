/**
 *  Validate that required arguments are present.
 */
module.exports = function() {
  return function required(req, next) {
    if(!arguments.length) return;
    var z, arg, errors = this.errors;
    for(z in this._arguments) {
      arg = this._arguments[z];
      if(!arg.optional() && !req.result.options[arg.key()]) {
        next(errors.EREQUIRED, [arg.names().join(' | ')], {arg: arg});
      }
    }
    next();
  }
}
