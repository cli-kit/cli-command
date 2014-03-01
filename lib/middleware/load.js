var loader = require('../loader');

/**
 *  Loads program commands, options and help information
 *  from a markdown definition.
 */
module.exports = function(options) {
  var conf = this.configure();
  if(!conf.load.file) return this;
  options = options || conf.load.options || {};
  //console.log('load middleware %j', conf);
  return function load(req, next) {
    if(!arguments.length) return;
    var scope = this;
    loader.call(this, conf.load.file, options, conf.load.env, function() {
      if(arguments.length) {
        return next.apply(null, arguments);
      }
      scope.emit('load', req);
      next();
    });
  }
}
