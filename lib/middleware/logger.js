var define = require('cli-define').define;

/**
 *  Decorates the program with a logger assigned to the log
 *  property of the program.
 *
 *  @param conf A configuration to pass when initializing
 *  the logger module.
 */
module.exports = function(conf) {
  conf = conf || this.configure().rc;
  var log = require('cli-logger')(conf);
  define(this, 'log', log, false);
  return this;
}

module.exports.action = handler;
