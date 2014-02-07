/**
 *  Executes action functions assigned to defined options.
 */
module.exports = function() {
  return function action(req, next) {
    if(!arguments.length) return;
    //console.dir(req);
    var proceed = true, handler, z, arg;
    var result = req.result || {keys: []};
    //console.dir(all);
    for(z in this._arguments) {
      arg = this._arguments[z];
      handler = arg.action();
      if(~result.keys.indexOf(z)
        && handler && typeof(handler) == 'function') {
        //console.log('calling action %s', z);
        proceed = handler.call(this, req, next);
      }
    }
    if(proceed) next();
  }
}
