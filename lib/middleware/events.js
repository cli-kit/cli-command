/**
 *  Dispatches events for all parsed arguments that match
 *  a known option.
 */
module.exports = function() {
  return function events(req, next) {
    if(!arguments.length) return;
    var z, arg;
    for(z in req.result.all) {
      arg = this._options[z];
      if(arg) {
        this.emit(arg.key(), req, arg, req.result.all[z]);
      }
    }
    next();
  }
}
