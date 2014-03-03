var loader = require('../loader');

/**
 *  Loads program commands, options and help information
 *  from a markdown definition.
 */
module.exports = function(options) {
  var conf = this.configure();
  if(!conf.load.file) return this;
  //console.log('loading definition for %s', this.name());
  //console.dir(conf);
  options = options || conf.load.options || {};
  //console.log('load middleware %j', conf);
  return function load(req, next) {
    if(!arguments.length) return;

    // we need to set up some initial
    // data for the substitute middleware
    req.substitute = {
      0: this.name(),
      description: this.description()
    }

    var scope = this;
    loader.call(this, conf.load.file, options, function() {
      if(arguments.length) {
        return next.apply(null, arguments);
      }

      scope.emit('load', req);
      next();
    });
  }
}
