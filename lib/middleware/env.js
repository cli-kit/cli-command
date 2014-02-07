var conflict = require('../conflict');
var cli = require('cli-define');
var Option = cli.Option;

/**
 *  Imports program-specific environment variables
 *  into the program.
 */
module.exports = function() {
  return function env(req, next) {
    var environ = this.env(), z, receiver = this.getReceiver();
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
          if((z in this) && typeof(this[z]) == 'function') {
            return conflict.call(this, z, new Option(z));
          }
          // TODO: use assign() here so that argument values are in sync
          if(!all && this._arguments[z]) {
            receiver[z] = environ[z];
          }else if(conf.env.merge === true){
            receiver[z] = environ[z];
          }
        }
      }
    }
    next();
  }
}
