/**
 *  Executes action functions assigned to defined options.
 */
module.exports = function() {
  return function action(req, next) {
    var proceed = true, handler, z, arg;
    var result = req.result || {keys: []};
    for(z in this._options) {
      arg = this._options[z];
      handler = arg.action();
      if(~result.keys.indexOf(z)
        && handler && typeof(handler) == 'function') {
          //console.dir(req.result);
        arg.value(req.result.all[z]);
        req.option = arg;
        proceed = handler.call(this, req, next);
      }
    }
    proceed ? next() : next(true);
  }
}
