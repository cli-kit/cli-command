var assign = require('../util/assign');

/**
 *  Iterate over the options and ensure that the receiver
 *  (program or stash) has the default values.
 */
module.exports = function() {
  return function defaults(req, next) {
    var opts = this._options, k, v;
    for(k in opts) {
      v = opts[k].value();
      if(v !== undefined) {
        assign.call(this, opts[k], k, v);
      }
    }
    next();
  }
}
