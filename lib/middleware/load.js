var util = require('util');
var loader = require('../loader');
var loaded = false;

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
    var scope = this;

    // already cached
    if(loaded) {
      //console.log('skipping load on cache');
      //scope.emit('load', req);
      return next();
    }

    //console.log('running load middleware');

    // we need to set up some initial
    // data for the substitute middleware
    req.substitute = {
      0: this.name(),
      cli: util.format('%s(1)', this.name()),
      description: this.description()
    }

    loader.call(this, conf.load.file, options, function() {
      if(arguments.length) {
        return next.apply(null, arguments);
      }
      scope.emit('load', req);
      if(conf.load.cache) loaded = module.exports.loaded = true;
      next();
    });
  }
}

module.exports.loaded = loaded;
