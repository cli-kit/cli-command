var Flag = require('cli-define').Flag;
var logger = require('./logger');

/**
 *  Adds a debug flag to the program.
 *
 *  When this option is specified the configuration trace
 *  property is enabled to always print stack traces for errors.
 *
 *  If the logger middleware is in use then the log level is
 *  set to print all log messages.
 *
 *  @param name The option name.
 *  @param description The option description.
 */
module.exports = function(name, description) {
  name = name || '--debug';
  description = description || 'enable debugging';
  var opt = new Flag(name, description);
  var key = opt.key();
  this.flag(opt);
  this.once(key, function(req, arg, value) {
    if(value === true) {
      this.configure().trace = true;
      if(logger.use && this.log) {
        var log = require('cli-logger');
        this.log.level(this.log.bitwise ? log.BW_ALL : log.TRACE);
      }
    }
  })
  module.exports.key = key;
  return this;
}
