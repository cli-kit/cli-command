var coerce = require('../util/coerce').coerce;
var assign = require('../util/assign');

module.exports = function() {
  return function merge(req, next) {
    if(!arguments.length) return;
    var receiver = this.getReceiver();
    var k, v, arg;
    for(k in req.result.all) {
      arg = this._arguments[k];
      if(arg) {
        v = req.result.all[k];
        if(arg.multiple() && !Array.isArray(v)) {
          v = [v];
        }
        try {
          v = coerce.call(this, arg, v);
        }catch(e) {
          return next(e);
        }
        assign.call(this, arg, k, v);
      }
    }
    next();
  }
}
