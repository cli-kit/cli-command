var path = require('path')
  , util = require('util')

  , middleware = require('cli-middleware')
  , utils = require('cli-util')
  , define = utils.define
  , merge = utils.merge
  , funcname = utils.funcname
  , logger = require('cli-logger')

  , cli = require('cli-define')
  , Program = cli.Program
  , Option = cli.Option
  , Flag = cli.Flag
  , Command = cli.Command
  , key = cli.key

  , clierr = require('cli-error')
  , errors = clierr.errors
  , ErrorDefinition = clierr.ErrorDefinition
  , CliError = clierr.CliError

  // TODO: make ExecError available
  , errs = {}
  , types = require('cli-types')
  , conflict = require('cli-conflict')
  , system = require('cli-system')

  , syslog = require('./lib/syslog').log;

var debug = !!process.env.CLI_TOOLKIT_DEBUG;

// backward compatible property access
system.include(true);

var all = system.standard();

errs.type = types.ArgumentTypeError;

var defaults = require('./lib/defaults');

var CommandProgram = function() {
  Program.apply(this, arguments);

  var conf = merge(defaults, {}, {copy: true})

  // private
  define(this, '_middleware', undefined, true);
  define(this, '_conf', conf, true);
  define(this, '_request', undefined, true);
  define(this, '_middlecache', [], true);

  // TODO: remove this circular reference
  this._conf.stash = this;

  // public
  define(this, 'errors', errors, false);
}

util.inherits(CommandProgram, Program);

/**
 *  Get or set the middleware request object.
 *
 *  @param req The request object.
 */
function request(req) {
  if(!arguments.length) return this._request;
  this._request = req;
  return this;
}
define(CommandProgram.prototype, 'request', request, false);

/**
 *  Wrap an error from an error definition, string
 *  or Error instance.
 *
 *  @param err The error definition, string or Error.
 *  @param parameters The message replacement parameters.
 *  @param source A source error to wrap.
 */
function wrap(err, parameters, source) {
  var msg = 'Cannot wrap invalid error \'' + err + '\'';
  if(!err) {
    throw new TypeError(msg);
  }
  var e, code = err.code || errors.EGENERIC.code;
  if(err instanceof CliError) {
    e = err;
  }else if(err instanceof ErrorDefinition) {
    e = err.toError(source, parameters);
    if(!source) e.shift();
    e.parameters = parameters;
    //e.key = err.key;
  }else if(err instanceof Error) {
    e = new CliError(err, code, parameters);
    e.key = err.key || errors.EGENERIC.key;
    err.key = e.key;
  }else if(typeof err === 'string') {
    e = new CliError(source || err, code, parameters);
  }else{
    throw new TypeError(msg);
  }
  return e;
}
define(CommandProgram.prototype, 'wrap', wrap, false);

/**
 *  Raise an error from an error definition or error
 *  instance.
 *
 *  @param err The error definition.
 *  @param parameters The message replacement parameters.
 *  @param source A source error to wrap.
 */
function raise(err, parameters, source) {
  var e = this.wrap(err, parameters, source);
  this.emit('raise', e, errors, err, parameters, source);
  this.emit('error', e, errors, err, parameters, source);
  return e;
}
define(CommandProgram.prototype, 'raise', raise, false);

/**
 *  Define program middleware.
 */
function use(middleware) {
  var i, nm, closure, conf = this.configure();
  var ind = -1, args = [].slice.call(arguments, 1);
  if(middleware === false) {
    this._middlecache = [];
    this._middleware = [];
    return this;
  }
  if(typeof middleware === 'number') {
    ind = middleware;
    middleware = arguments[1];
    args = [].slice.call(arguments, 2);
  }
  if(!arguments.length && this._middleware === undefined) {
    //if(!all) {
      //all = system.standard();
    //}
    for(i = 0;i < all.length;i++) {
      if(conf && conf.middleware) {
        closure = all[i].call(this);
        if(typeof closure !== 'function') {
          continue;
        }
        nm = funcname(closure);
        //console.log('got name %s', nm);
        if(nm && conf.middleware[nm] === false) {
          continue;
        }
      }
      this.use(all[i]);
    }
    return this;
  }
  if(typeof middleware != 'function') {
    throw new Error('Invalid middleware, must be a function');
  }
  closure = middleware.apply(this, args);
  if(this._middlecache && ~this._middlecache.indexOf(middleware)) {
    throw new Error('Invalid middleware, duplicate detected');
  }
  if(typeof(closure) == 'function') {
    if(this._middleware === undefined) this._middleware = [];
    if(ind < 0 || ind >= this._middleware.length) {
      //console.log('adding closure... %s', closure);
      this._middleware.push(closure);
    }else{
      this._middleware.splice(ind, 0, closure);
    }
  }

  this._middlecache.push(middleware);

  return this;
}
define(CommandProgram.prototype, 'use', use, false);

/**
 *  Default error handler for the error event.
 *
 *  @param e The error instance.
 */
function error(e) {
  var conf = this.configure();
  if(!(e instanceof CliError)) {
    e = this.wrap(e);
  }
  var trace =
    (conf.trace !== undefined)
      ? conf.trace : (e.code === errors.EUNCAUGHT.code);
  //console.log('conf.trace %s', conf.trace);
  //console.log('trace %s', trace);
  //console.log('code %s', e.code);
  var logger = this.log && typeof(this.log.error) === 'function';
  if(logger && conf.error.log) {
    if(conf.error.log.print) {
      var args = (e.parameters || []).slice(0);
      args.unshift(e.message);
      this.log.error.apply(this.log, args);
      if(trace) {
        var stack = e.stack;
        if(stack) {
          var lines = e._stacktrace || [];
          lines = lines.map(function(value) {
            return '  ' + value;
          })
          stack = lines.join('\n');
          this.log.error(stack);
        }
      }
    }else{
      //console.dir(e);
      this.log.error(e);
    }
  }else{
    e.error(trace)
  }
  if(conf.exit) e.exit();
}
define(CommandProgram.prototype, 'error', error, false);

/**
 *  Assigns configuration information to the program.
 *
 *  @param conf The program configuration.
 */
function configure(conf) {
  if(!arguments.length) return this._conf;
  conf = conf || {};
  this._conf = merge(conf, this._conf);
  if(conf.stash) {
    this._conf.stash = conf.stash;
  }

  // load custom error definitions
  if(conf && conf.error
    && typeof conf.error === 'object' && conf.error.locales) {
    clierr.file(conf.error, function(err) {
      if(err) throw err;
    })
  }
  return this;
}
define(CommandProgram.prototype, 'configure', configure, false);

/**
 *  Adds a version flag to the program.
 *
 *  @param semver A specific version number.
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 */

// WARN: do not use, this is too overloaded, will be removed
// WARN: do: cli.use(require('cli-mid-version')) instead for the middleware
function version(semver, name, description, action) {
  if(arguments.length === 1 && typeof semver === 'string') {
    this._version = semver;
    return this;
  }
  if(!arguments.length && this._options.versionopt) return this._version;
  return this.use(system.version, semver, name, description, action);
}
define(CommandProgram.prototype, 'version', version, false);

/**
 *  Reset all values assigned to options.
 *
 *  Designed to be used in the scenario that you wish
 *  to re-parse through the same instance and ensure that
 *  values do not carry through.
 */
function reset(target) {
  target = target || this.configure().stash || this;
  var opts = target.options(), k;
  for(k in opts) {
    delete opts[k].value(undefined);
  }
  var cmds = target.commands();
  for(k in cmds) {
    reset(cmds[k]);
  }
}
define(CommandProgram.prototype, 'reset', reset, false);

/**
 *  Adds a help flag to the program.
 *
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 */
function help(name, description, action) {
  return this.use(system.help, name, description, action);
}
define(CommandProgram.prototype, 'help', help, false);

/**
 *  Parse the supplied arguments and execute any commands
 *  found in the arguments, preferring the built in commands
 *  for help and version.
 *
 *  @param args The arguments to parse, default is process.argv.slice(2).
 *  @param req An existing request object to use.
 *  @param cb A complete callback function.
 */
function parse(args, req, cb) {
  if(typeof req === 'function') {
    cb = req;
    req = null;
  }
  var conf = this.configure();
  args = args || process.argv.slice(2);
  conflict.call(this);

  if(this._middleware === undefined) {
    this.use();
  }

  var opts = {
    syslog: syslog,
    list: this._middleware,
    errors: this.errors,
    bail: conf.bail,
    throws: true,
    intercept: conf.error.intercept,
    scope: this
  }
  var runner = middleware(opts);
  // NOTE: want to be using this again!
  //runner(args, req, cb);

  // NOTE: backward compatible argument order switch
  // NOTE: allows us to upgrade cli-middleware but not
  // NOTE: break absolutely everything
  runner(args, req, function(err, req) {
    if(cb) {
      cb.call(this, req, err);
    }else{
      this.emit('complete', req, err);
    }
  });
  return this;
}
define(CommandProgram.prototype, 'parse', parse, false);

module.exports = function(package, name, description, options) {
  options = options || {};
  var locales = path.join(__dirname, 'lib', 'error', 'locales');
  clierr.file({locales: locales});
  var program = cli(package, name, description, CommandProgram);
  var listeners = process.listeners('uncaughtException');
  if(!listeners.length) {
    process.on('uncaughtException', function(err) {
      err.code = errors.EUNCAUGHT.code;
      //console.dir(err);
      //console.log(err.stack);
      program.raise(err);
    })
  }
  if(debug) {
    syslog.level(logger.TRACE);
  }
  if(options.log === false) {
    syslog.level(logger.NONE);
  }
  // TODO: allow setting error configuration on the program configuration
  clierr({name: program.name()});
  return program;
}

// classes
module.exports.Interface = require('./interface');
module.exports.CommandProgram = CommandProgram;
module.exports.Program = Program;
module.exports.Command = Command;
module.exports.Option = Option;
module.exports.Flag = Flag;
module.exports.ErrorDefinition = ErrorDefinition;
module.exports.CliError = CliError;

// library exports
module.exports.defaults = defaults;

// deprecated legacy access via middleware
module.exports.middleware = system;

// new access via system (use this)
module.exports.system = system;

module.exports.help = system.help.action;
module.exports.version = system.version.action;

// dependency exports
module.exports.util = utils;
module.exports.define = cli;
module.exports.logger = logger;

// decorate with internal error classes
clierr.ArgumentTypeError = errs.type;
module.exports.error = clierr;

// internal libraries
module.exports.types = types;
module.exports.log = syslog;
