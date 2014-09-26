var path = require('path')
  , util = require('util')
  , middleware = require('cli-middleware')
  , utils = require('cli-util')
  , merge = utils.merge
  , argparse = require('cli-argparse')
  , fs = require('cli-fs')
  , env = require('cli-env')
  , native = require('cli-native')
  , logger = require('cli-logger')
  , circular = require('circular')

  , cli = require('cli-define')
  , Program = cli.Program
  , Option = cli.Option
  , Flag = cli.Flag
  , Command = cli.Command
  , define = cli.define
  , key = cli.key

  , clierr = require('cli-error')
  , errors = clierr.errors
  , ErrorDefinition = clierr.ErrorDefinition
  , CliError = clierr.CliError

  , errs = require('./lib/error')
  , doc = require('cli-help')
  , types = require('./lib/types')
  , conflict = require('cli-conflict')
  , middlewares = require('./lib/middleware')
  , funcname = utils.funcname
  , syslog = require('./lib/syslog').log
  , ConverterMap = require('./lib/util/map');

var debug = !!process.env.CLI_TOOLKIT_DEBUG;

var __middleware__;

var defaults = {
  // mark this program as an interactive REPL
  // console, use this flag to modify program
  // behaviour when running interactively
  interactive: false,
  parser: {
    // map be a function, gets passed the parser configuration
    // and should modify it in place
    configure: null
  },
  load: {
    file: null,
    options: null
  },
  substitute: {
    escaping: true,
    enabled: false
  },
  command: {
    exec: false,
    dir: null
  },
  exit: !(process.env.NODE_ENV === 'test'),
  bail: (process.env.NODE_ENV === 'test'),
  stash: null,
  bin: null,
  env: null,
  synopsis: {
    options: true,
    commands: true
  },
  help: {
    indent: 1,
    exit: false,
    pedantic: true,
    vanilla: false,
    sort: false,
    maximum: 80,
    width: 20,
    align: 'column',
    collapse: false,
    messages: {
      summary: 'Command should be one of: %s',
      cmd: 'where <command> is one of:\n',
      usage: {
        command: 'command',
        option: 'option',
        args: 'args'
      },
      bugs: 'Report bugs to %s.'
    },
    name: '--help',
    description: 'display this help and exit',
    action: null
  },
  trace: process.env.NODE_ENV === 'test',
  unknown: true,
  strict: false,
  middleware: null,
  // logger middleware configuration
  log: null,

  // error handling configuration
  // declare a locales property to merge
  // custom error definitions with the default
  // error definitions
  error: {
    // if a logger is available, send errors to the log
    log: {
      // print errors
      print: true
    },
    intercept: null
  },
  // programs may maintain a list of errors encountered
  errors: null,
  manual: null,
  // property name conflict detection enabled by default
  // should typically remain enabled, however for interactive
  // programs that may parse() multiple times this allows it
  conflict: true
}

var all = [
  middlewares.error,
  middlewares.stdin,
  middlewares.boot,
  middlewares.load,
  middlewares.substitute,
  middlewares.parser,
  middlewares.unparsed,
  middlewares.defaults,
  middlewares.events,
  middlewares.action,
  middlewares.eunknown,
  middlewares.emultiple,
  middlewares.erequired,
  middlewares.rc,
  middlewares.env,
  middlewares.multiple,
  middlewares.merge,
  middlewares.convert,
  middlewares.variables,
  middlewares.notify,
  middlewares.ecommand,
  middlewares.ready,
  middlewares.exec,
  middlewares.command,
  middlewares.empty,
  middlewares.run];

var CommandProgram = function() {
  Program.apply(this, arguments);
  __middleware__ = [];

  // not that merge maintains object references so defaults
  // would get polluted with this merge, for most programs this
  // is not an issue however it breaks the unit tests so that
  // quick fix is the stringify/parse clone
  // really merge() should be able to create new object and merge them
  // both
  var conf = merge(JSON.parse(JSON.stringify(defaults)), {});
  // private
  define(this, '_middleware', undefined, true);
  define(this, '_conf', conf, true);
  define(this, '_request', undefined, true);

  //
  this._conf.stash = this;

  // public
  define(this, 'errors', errors, false);

  //this.use(middlewares.error);
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
    __middleware__ = [];
    this._middleware = [];
    return this;
  }
  if(typeof middleware === 'number') {
    ind = middleware;
    middleware = arguments[1];
    args = [].slice.call(arguments, 2);
  }
  if(!arguments.length && this._middleware === undefined) {
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
  if(~__middleware__.indexOf(middleware)) {
    //console.dir(__middleware__);
    throw new Error('Invalid middleware, duplicate detected');
  }
  if(typeof(closure) == 'function') {
    if(this._middleware === undefined) this._middleware = [];
    if(ind < 0 || ind >= __middleware__.length) {
      this._middleware.push(closure);
    }else{
      this._middleware.splice(ind, 0, closure);
    }
  }else{
    // mark the middleware as in use
    middleware.use = true;
  }

  __middleware__.push(middleware);

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
function version(semver, name, description, action) {
  if(!arguments.length && this._options.versionopt) return this._version;
  return this.use(middlewares.version, semver, name, description, action);
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
  return this.use(middlewares.help, name, description, action);
}
define(CommandProgram.prototype, 'help', help, false);

/**
 *  Parse the supplied arguments and execute any commands
 *  found in the arguments, preferring the built in commands
 *  for help and version.
 *
 *  @param args The arguments to parse, default is process.argv.slice(2).
 */
function parse(args, cb) {
  if(debug) syslog.trace(circular.stringify(this, 2));
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
  runner(args, cb);
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
module.exports.CommandProgram = CommandProgram;
module.exports.Program = Program;
module.exports.Command = Command;
module.exports.Option = Option;
module.exports.Flag = Flag;
module.exports.ConverterMap = ConverterMap;
module.exports.ErrorDefinition = ErrorDefinition;
module.exports.CliError = CliError;

// library exports
module.exports.defaults = defaults;
module.exports.middleware = middlewares;
module.exports.help = middlewares.help.action;
module.exports.version = middlewares.version.action;

// dependency exports
module.exports.argparse = argparse;
module.exports.util = utils;
module.exports.define = cli;
module.exports.logger = logger;
module.exports.circular = circular;
module.exports.fs = fs;
module.exports.env = env;
module.exports.native = native;

// decorate with internal error classes
clierr.ArgumentTypeError = errs.type;
clierr.ExecError = errs.exec;
module.exports.error = clierr;

// internal libraries
module.exports.types = types;
module.exports.log = syslog;
module.exports.doc = doc;
