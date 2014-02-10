var assign = require('../util/assign');
var conflict = require('../conflict');
var Option = require('cli-define').Option;

/**
 *  Imports program-specific environment variables
 *  into the program.
 */
module.exports = function() {
  return function env(req, next) {
    if(!arguments.length) return;
    var environ, z, arg;
    var conf = this.configure();
    if(conf.env) {
      if(typeof conf.env.prefix != 'string') {
        conf.env.prefix = this.name();
      }
      if(!conf.env.match) {
        conf.env.match = new RegExp('^' + this.name() + '_');
      }
      conf.env.initialize = true;
      environ = require('cli-env')(conf.env);
      req.env = environ;
      var all = typeof(conf.env.merge) == 'string';
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
    }
    next();
  }
}
