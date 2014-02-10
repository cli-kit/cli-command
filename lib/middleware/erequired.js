/**
 *  Validate that required arguments are present.
 */
module.exports = function() {
  return function erequired(req, next) {
    if(!arguments.length) return;
    var z, arg;
    for(z in this._options) {
      arg = this._options[z];
      if(!arg.optional() && !req.result.options[arg.key()]) {
        return next(this.errors.EREQUIRED, [arg.toString(null)]);
      }
    }
    next();
  }
}
