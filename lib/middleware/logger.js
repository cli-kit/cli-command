var define = require('cli-define').define;
var color = require('./color');

/**
 *  Decorates the program with a logger assigned to the log
 *  property of the program.
 *
 *  @param conf A configuration to pass when initializing
 *  the logger module.
 */
module.exports = function(conf) {
  conf = conf || this.configure().log;
  var logger = require('cli-logger');
  var scope = this;
  if(color.use && !conf) {
    conf = {
      console: true,
      prefix: function(record) {
        return scope.name() + ': ';
      }
    };
  }
  var log = logger(conf);
  define(this, 'log', log, false);
  return this;
}
