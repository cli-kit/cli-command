var path = require('path');
var util = require('util');

var merge = require('cli-util').merge;
var types = require('./lib/types');
var clierr = require('cli-error');
var conflict = require('./lib/conflict');
var middlewares = require('./lib/middleware');
var cname = require('./lib/util/name');

var cli = require('cli-define');
var define = cli.define;
var key = cli.key;
var Program = cli.Program;
var Option = cli.Option;

var errors = clierr.errors;
var ErrorDefinition = clierr.ErrorDefinition;
var CliError = clierr.CliError;

var defaults = {
  exit: true,
  stash: null,
  bin: null,
  env: null,
  trace: false,
  middleware: null
}

var all = [
  middlewares.error,
  middlewares.parser,
  middlewares.unparsed,
  middlewares.defaults,
  middlewares.env,
  middlewares.merge,
  middlewares.multiple,
  middlewares.exec,
  middlewares.action,
  middlewares.required,
  middlewares.command,
  middlewares.empty,
  middlewares.run];

var CommandProgram = function() {
  Program.apply(this, arguments);
  // private
  define(this, '_middleware', undefined, true);
  define(this, '_configuration', merge(defaults, {}), false);
  define(this, '__middleware__', [], false);
  define(this, '_exec', {}, false);

  // public
  define(this, 'errors', errors, false);

  // TODO: depreacte this public property
  define(this, 'args', [], true);
}

util.inherits(CommandProgram, Program);

/**
 *  Get a reference to the object that will be assigned
 *  properties corresponding to the argument values.
 *
 *  This will be either the program instance or a stash object
 *  if the program has been configured to use a stash.
 */
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
  var e, code, source = data && data.error ? data.error : null;
  if(err instanceof CliError) {
    e = err;
  }else if((err instanceof ErrorDefinition)) {
    e = err.toError(source);
    if(!source) e.shift();
    e.parameters = parameters || [];
    e.key = err.key;
    e.data = data;
    //if(data && data.error) e.source = data.error;
  }else if(err instanceof Error) {
    code = err.code || errors.EUNCAUGHT.code;
    e = new CliError(err, code, parameters);
    e.key = err.key || errors.EUNCAUGHT.key;
  }
  this.emit('error', e, errors);
}
define(CommandProgram.prototype, 'raise', raise, false);

/**
 *  Override so we can maintain a list of commands
 *  that should be executed as external child processes.
 *
 *  @param name The command name.
 *  @param description The command description.
 *  @param options The command options.
 */
function command(name, description, options) {
  var cmd = Program.prototype.command.apply(this, arguments);
  if(description) {
    var id = key(name);
    this._exec[id] = cmd;
  }
  return cmd;
}
define(CommandProgram.prototype, 'command', command, false);

/**
 *  Define program middleware.
 */
function use(middleware) {
  var i, nm, args, result, conf = this.configuration();
  if(!arguments.length && this._middleware === undefined) {
    for(i = 0;i < all.length;i++) {
      if(conf && conf.middleware) {
        result = all[i].call(this);
        if(typeof result !== 'function') {
          continue;
        }
        nm = cname(result);
        //console.log('got name %s', nm);
        if(nm && conf.middleware[nm] === false) {
          continue;
        }
      }
      this.use(all[i]);
    }
    return this;
  }
  args = [].slice.call(arguments, 1);
  if(typeof middleware != 'function') {
    throw new Error('Invalid middleware, must be a function');
  }
  result = middleware.apply(this, args);

  if(~this.__middleware__.indexOf(middleware)) {
    throw new Error('Invalid middleware, duplicate detected');
  }

  if(typeof(result) == 'function') {
    if(this._middleware === undefined) this._middleware = [];
    this._middleware.push(result);
  }

  this.__middleware__.push(middleware);

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
  var conf = this.configuration();
  var trace =
    (e.code === errors.EUNCAUGHT.code || conf.trace) ? true : false;
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
  merge(conf, this._configuration || merge(config, {}));
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
    this.use();
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
    //console.log('exec middleware: %s', func)
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
      err.code = errors.EUNCAUGHT.code;
      program.raise(err);
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
