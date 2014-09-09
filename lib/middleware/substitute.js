var substitutor = require('../loader/substitute');
var load = require('./load');

var loaded = false;

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
    if(loaded) {
      return next();
    }
    substitutor.call(this, req.substitute || {},
      conf.escaping !== undefined ? conf.escaping : true);
    this.emit('substitute', req);
    if(this.configure().load.cache) {
      loaded = module.exports.loaded = true;
    }
    next();
  }
}
