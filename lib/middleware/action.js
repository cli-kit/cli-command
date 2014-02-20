/**
 *  Executes action functions assigned to defined options.
 */
module.exports = function() {
  return function action(req, next) {
    if(!arguments.length) return;
    var proceed = true, handler, z, arg;
    var result = req.result || {keys: []};
    for(z in this._options) {
      arg = this._options[z];
      handler = arg.action();
      if(~result.keys.indexOf(z)
        && handler && typeof(handler) == 'function') {
        proceed = handler.call(this, req, next);
      }
    }
    proceed ? next() : next(true);
  }
}
