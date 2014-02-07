var assign = require('../util/assign');
var conflict = require('../conflict');
var Option = require('cli-define').Option;

/**
 *  Imports program-specific environment variables
 *  into the program.
 */
module.exports = function() {
  return function env(req, next) {
    var environ = this.env(), z, receiver = this.getReceiver(), arg;
    var conf = this.configuration();
    if(!environ && conf.env) {
      if(typeof conf.env.prefix != 'string') {
        conf.env.prefix = this.name();
      }
      if(!conf.env.match) {
        conf.env.match = new RegExp('^' + this.name() + '_');
      }
      conf.env.initialize = true;
      environ = require('cli-env')(conf.env);
      this.env(environ);
      var all = typeof(conf.env.merge) == 'string';
      if(conf.env.merge) {
        for(z in environ) {
          arg = this._arguments[z];
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
