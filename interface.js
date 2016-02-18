var cli = require('./index');

/**
 *  Abstract program interface.
 *
 *  Encourages decoupling of program configuration from
 *  the executable to enable testing applications without
 *  creating a child process.
 *
 *  This allows code instrumentation and therefore code
 *  coverage.
 *
 *  @param pkg The package descriptor, object or string.
 *  @param name The program name.
 *  @param description The program description.
 *  @param clazz A Program subclass to instantiate.
 */
var CommandInterface = function(pkg, name, description, clazz) {
  this.program = cli(pkg, name, description, clazz);
  this.configure.call(this.program);
  this.use.call(this.program);
  this.command.call(this.program);
  this.option.call(this.program);
  this.events.call(this.program);
};

/**
 *  Configure the program, scope is the program.
 */
CommandInterface.prototype.configure = function(){};

/**
 *  Configure middleware, scope is the program.
 */
CommandInterface.prototype.use = function(){};

/**
 *  Configure command options, scope is the program.
 */
CommandInterface.prototype.command = function(){};

/**
 *  Configure argument options, scope is the program.
 */
CommandInterface.prototype.option = function(){};

/**
 *  Configure events, scope is the program.
 */
CommandInterface.prototype.events = function(){};

/**
 *  Parse the program arguments, proxies to the program instance.
 */
CommandInterface.prototype.parse = function() {
  return this.program.parse.apply(this.program, arguments);
};

module.exports = CommandInterface;

// legacy, do not use, will be removed
module.exports.CommandInterface = CommandInterface;
module.exports.cli = cli;
