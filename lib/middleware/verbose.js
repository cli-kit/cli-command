var Flag = require('cli-define').Flag;
var logger = require('cli-logger');
var debug = require('./debug');

/**
 *  Adds a verbose option to the program.
 *
 *  When combining with the logger and debug middleware, this middleware
 *  should be used afterwards.
 *
 *  This option modifies a log level if the logger middleware is in use
 *  by testing whether a log property is assigned to the program.
 *
 *  If the levels argument is a function then it is added as a listener for
 *  the verbose option event. Otherwise, it should be an object containing
 *  the properties: on, off and debug which are integers indicating the
 *  log levels to use.
 *
 *  The off level is the default used, if not specified WARN is used.
 *  The on level is used when the verbose option is present in the argument
 *  list, default value is INFO.
 *  The debug level is used when the program encounters a debug flag,
 *  typically this is enabled by using the debug middleware, the default
 *  level used is DEBUG.
 *
 *  If you have enabled bitwise mode for the logger middleware you should
 *  take care to ensure you also specify bitwise log levels in the levels
 *  object.
 *
 *  WARN: This can override a default log level configured for the logger
 *  middleware which can be confusing. For example, if you configure the
 *  logger middleware with an INFO level and the verbose option is not
 *  specified then info log messages will *not* be printed.
 *
 *  @param name The option name.
 *  @param description The option description.
 *  @param levels An object containing log level integers
 *  to use when the verbose option is encountered.
 */
module.exports = function(name, description, levels) {
  name = name || '-v, --verbose';
  description = description || 'print more information';
  var opt = new Flag(name, description);
  this.option(opt);
  var on = (levels && typeof(levels.on) === 'number')
    ? levels.on : logger.INFO;
  var off = (levels && typeof(levels.off) === 'number')
    ? levels.off : logger.WARN;
  var dbg = (levels && typeof(levels.debug) === 'number')
    ? levels.debug : logger.DEBUG;
  var listener = (typeof levels === 'function')
    ? levels : function verbose(req, arg, value) {
      if(this.log) {
        var level = value ? on : off;
        this.log.level(level);
      }
    }

  // set default level as soon as possible
  if(this.log) {
    this.log.level(off);
  }

  this.once(opt.key(), listener);
  if(debug.use) {
    this.once(debug.key, function(req, arg, value) {
      if(this.log && value) {
        this.log.level(dbg);
      }
    })
  }
  return this;
}
