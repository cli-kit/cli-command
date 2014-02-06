/**
 *  Executes action functions assigned to defined options.
 */
module.exports = function() {
  return function(req, next) {
    //console.dir(req);
    var proceed = true, action, z, arg;
    var result = req.result || {keys: []};
    //console.dir(all);
    for(z in this._arguments) {
      arg = this._arguments[z];
      action = arg.action();
      if(~result.keys.indexOf(z)
        && action && typeof(action) == 'function') {
        //console.log('calling action %s', z);
        proceed = action.call(this, req, next);
      }
    }
    if(proceed) next();
  }
}
