var conflict = require('../conflict');
var cli = require('cli-define');
var Option = cli.Option;

/**
 *  Imports program-specific environment variables
 *  into the program.
 */
module.exports = function() {
  return function environ(req, next) {
    var env = this.env(), z, receiver = this.getReceiver();
    var conf = this.configuration();
    if(!env && conf.env) {
      if(typeof conf.env.prefix != 'string') {
        conf.env.prefix = this.name();
      }
      if(!conf.env.match) {
        conf.env.match = new RegExp('^' + this.name() + '_');
      }
      conf.env.initialize = true;
      env = require('cli-env')(conf.env);
      this.env(env);
      var all = typeof(conf.env.merge) == 'string';
      if(conf.env.merge) {
        for(z in env) {
          if((z in this) && typeof(this[z]) == 'function') {
            return conflict.call(this, z, new Option(z));
          }
          if(!all && this._arguments[z]) {
            receiver[z] = env[z];
          }else if(conf.env.merge === true){
            receiver[z] = env[z];
          }
        }
      }
    }
    next();
  }
}
