var assign = require('../util/assign');

/**
 *  Finds arguments specified as multiple and ensures
 *  that the value is an empty array if no arguments
 *  were specified that set the value.
 *
 *  Should be specified *after* the merge middleware.
 */
module.exports = function() {
  return function multiple(req, next) {
    if(!arguments.length) return;
    var z, arg, receiver = this.getReceiver();
    for(z in this._arguments) {
      arg = this._arguments[z];
      if(arg.multiple() && arg.value() === undefined) {
        assign.call(this, arg, z, []);
      }
    }
    next();
  }
}
