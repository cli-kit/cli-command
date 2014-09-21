var assign = require('../util/assign');

/**
 *  Finds arguments specified as multiple and ensures
 *  that the value is an empty array if no arguments
 *  were specified that set the value.
 *
 *  Should be specified *before* the merge and or convert
 *  middleware.
 */
module.exports = function() {
  return function multiple(req, next) {
    var z, arg;
    for(z in this._options) {
      arg = this._options[z];
      if(arg.multiple() && arg.value() === undefined) {
        assign.call(this, arg, z, []);
      }
    }
    next();
  }
}
