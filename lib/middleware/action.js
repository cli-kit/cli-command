/**
 *  Executes action functions assigned to defined options.
 */
module.exports = function() {
  return function(req, next) {
    var proceed = true, action;
    for(var z in this._arguments) {
      action = this._arguments[z].action();
      if(action && typeof(action) == 'function') {
        proceed = action.call(this, req, next);
      }
    }
    if(proceed) next();
  }
}
