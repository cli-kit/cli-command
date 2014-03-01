var substitutor = require('../loader/substitute');

/**
 *  Performs variable substitution on program data.
 *
 *  Should be declared after the load middleware.
 */
module.exports = function(conf) {
  conf = conf || this.configure().substitute;
  if(!conf || !conf.enabled) return this;
  return function substitute(req, next) {
    if(!arguments.length) return;
    //console.dir(req.substitute);
    substitutor.call(this, req.substitute || {}, conf.escaping);
    next();
  }
}