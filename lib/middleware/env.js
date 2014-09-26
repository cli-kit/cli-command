var assign = require('../util/assign');
var conflict = require('cli-conflict');
var Option = require('cli-define').Option;
var utils = require('cli-util')
  , merge = utils.merge
  , delimited = utils.delimited
  , loaded;

/**
 *  Imports program-specific environment variables
 *  into the program.
 */
module.exports = function() {
  return function env(req, next) {
    var environ, z, arg;
    var conf = this.configure();
    if(conf.env) {
      if(loaded && conf.env.cache) {
        req.env = loaded.env;
        return next();
      }
      if(typeof conf.env.prefix !== 'string') {
        conf.env.prefix = this.name();
      }
      if(!conf.env.match) {
        conf.env.match =
          new RegExp('^' + conf.env.prefix.replace(/_+$/, '') + '_');
      }
      conf.env.initialize = true;
      environ = require('cli-env')(conf.env);
      req.env = environ;
      var all = typeof(conf.env.merge) === 'string';
      //console.log('merge all %s', all);
      // merging into target stash (typically the program)
      if(conf.env.merge) {
        for(z in environ) {
          arg = this._options[z];
          if((z in this) && typeof(this[z]) == 'function') {
            return conflict.call(this, z, arg || new Option(z));
          }
          if(!all && arg) {
            assign.call(this, arg, z, environ[z]);
          }else if(conf.env.merge === true){
            assign.call(this, arg, z, environ[z]);
          }
        }
      }

      // merge into rc object
      if(conf.env.rcmerge && req.rc) {
        if(typeof conf.env.rcmerge === 'function') {
          req.env = conf.env.rcmerge(req.env, req.rc);
        }else{
          req.env = merge(req.env, req.rc);
        }
      }
      loaded = {env: req.env};
    }
    next();
  }
}
