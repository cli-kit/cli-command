/**
 *  Validate that required arguments are present.
 */
module.exports = function() {
  return function erequired(req, next) {
    if(!arguments.length) return;
    var z, arg;
    for(z in this._arguments) {
      arg = this._arguments[z];
      if(!arg.optional() && !req.result.options[arg.key()]) {
        return next(this.errors.EREQUIRED, [arg.toString(null)]);
      }
    }
    next();
  }
}
