var path = require('path');
var util = require('util');

var cli = require('cli-define');
var define = cli.define;

var merger = require('cli-util').merge;

var types = require('./lib/types');
var clierr = require('cli-error');
var conflict = require('./lib/conflict');
var middlewares = require('./lib/middleware');

//var ArgumentTypeError = require('./lib/error/argument-type');
var Program = cli.Program;
var Option = cli.Option;
var ErrorDefinition = clierr.ErrorDefinition;
var CliError = clierr.CliError;
var errors = clierr.errors;
var defaults = {
  exit: true,
  stash: null,
  bin: null,
  env: null
}

var CommandProgram = function() {
  Program.apply(this, arguments);
  // private
  define(this, '_middleware', undefined, true);
  define(this, '_configuration', merger(defaults, {}), false);

  // public
  define(this, 'errors', errors, false);
  define(this, 'args', [], true);
}

util.inherits(CommandProgram, Program);

function getReceiver() {
  var receiver = this;
  var config = this.configuration();
  if((typeof(config.stash) == 'string') && config.stash.length) {
    receiver = this[config.stash] = this[config.stash] || {};
  }else if(config.stash && (typeof(config.stash) == 'object')) {
    receiver = config.stash;
  }
  return receiver;
}
define(CommandProgram.prototype, 'getReceiver', getReceiver, false);

/**
 *  Raise an error from an error definition or error
 *  instance.
 *
 *  @param err The error definition.
 *  @param parameters The message replacement parameters.
 *  @param data Additional error data.
 */
function raise(err, parameters, data) {
  // FIXME: if we have a source error in data.error
  // FIXME: we should use the stack trace from the source
  // FIXME: error, this makes for a more meaningful stack
  // FIXME: trace from uncaught exceptions
  var e;
  if(err instanceof CliError) {
    e = err;
  }else if((err instanceof ErrorDefinition)) {
    e = err.toError();
    e.shift();
    e.parameters = parameters || [];
    e.key = err.key;
    e.data = data;
    if(data && data.error) e.source = data.error;
  }
  this.emit('error', e, errors);
}
define(CommandProgram.prototype, 'raise', raise, false);

/**
 *  Define program middleware.
 */
function use(middleware) {
  //console.log(typeof(this._middleware));
  var args = [].slice.call(arguments, 1);
  if(typeof middleware != 'function') {
    throw new Error('Invalid middleware, must be a function');
  }
  var result = middleware.apply(this, args);
  if(typeof(result) == 'function') {
    if(this._middleware === undefined) this._middleware = [];
    this._middleware.push(result);
  }
  return this;
}
define(CommandProgram.prototype, 'use', use, false);

/**
 *  Get or set the environment instance.
 */
function env(value) {
  if(!arguments.length) return this._env;
  this._env = value;
  return this;
}
define(CommandProgram.prototype, 'env', env, false);

/**
 *  Default error handler for the error event.
 *
 *  @param e The error instance.
 */
function error(e) {
  var key = (e.key || '').toLowerCase();
  var trace = key == 'euncaught' ? true : false;
  e.error(trace);
  if(this._configuration.exit) e.exit();
}
define(CommandProgram.prototype, 'error', error, false);

/**
 *  Assigns configuration information to the program.
 *
 *  @param conf The program configuration.
 */
function configuration(conf) {
  if(!arguments.length) return this._configuration;
  conf = conf || {};
  var stash = conf.stash;
  if((typeof stash == 'string') && (stash in this)) {
    conflict.call(this, stash, new Option(stash));
    return this;
  }
  merger(conf, this._configuration || merger(config, {}));
  return this;
}
define(CommandProgram.prototype, 'configuration', configuration, false);

/**
 *  Adds a version flag to the program.
 *
 *  @param semver A specific version number.
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 */
function version(semver, name, description, action) {
  if(!arguments.length && this._arguments.versionopt) return this._version;
  return this.use(middlewares.version, semver, name, description, action);
}
define(CommandProgram.prototype, 'version', version, false);

/**
 *  Adds a help flag to the program.
 *
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 */
function help(name, description, action) {
  return this.use(middlewares.help, name, description, action);
}
define(CommandProgram.prototype, 'help', help, false);

/**
 *  Parse the supplied arguments and execute any commands
 *  found in the arguments, preferring the built in commands
 *  for help and version.
 *
 *  @param args The arguments to parse, default is process.argv.slice(2).
 *  @param options Configuration options.
 */
function parse(args) {
  args = args || process.argv.slice(2);
  conflict.call(this);
  if(this._middleware === undefined) {
    this.use(middlewares.error)
      .use(middlewares.parser)
      .use(middlewares.unparsed)
      .use(middlewares.defaults)
      .use(middlewares.env)
      .use(middlewares.merge)
      .use(middlewares.multiple)
      .use(middlewares.action)
      .use(middlewares.required)
      .use(middlewares.empty)
      .use(middlewares.run)
      .use(middlewares.command)
  }

  middleware.call(this, args);
  return this;
}
define(CommandProgram.prototype, 'parse', parse, false);

/**
 *  Execute middleware.
 *
 *  @param args The arguments passed to parse.
 */
function middleware(args) {
  var i = 0, list = this._middleware, scope = this;
  var req = {program: this, argv: args};
  function exec() {
    var func = list[i];
    func.call(scope, req, next);
  }
  function next(err, parameters, data) {
    if(err) {
      scope.raise(err, parameters, data);
    }
    i++;
    if(i < list.length) {
      exec();
    }
  }
  if(list.length) exec();
}

module.exports = function(package, name, description, configuration) {
  var locales = path.join(__dirname, 'lib', 'error', 'locales');
  clierr.file({locales: locales});
  var program = cli(package, name, description, CommandProgram);
  program.configuration(configuration || defaults);
  var listeners = process.listeners('uncaughtException');
  if(!listeners.length) {
    process.on('uncaughtException', function(err) {
      //console.error(err.stack);
      program.raise(errors.EUNCAUGHT, [err.message], {error: err});
    })
  }
  // TODO: allow setting error configuration on the program configuration
  clierr({name: program.name()});
  return program;
}

module.exports.middleware = middlewares;
module.exports.help = middlewares.help.action;
module.exports.version = middlewares.version.action;
module.exports.types = types;
module.exports.error = require('./lib/error');
