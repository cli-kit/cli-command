var path = require('path');
var util = require('util');

var merge = require('cli-util').merge;
var types = require('./lib/types');
var clierr = require('cli-error');
var conflict = require('./lib/conflict');
var middlewares = require('./lib/middleware');
var cname = require('./lib/util/name');
var logger = require('cli-logger');
var syslog = require('./lib/syslog').log;
var circular = require('circular');
var debug = !!process.env.CLI_TOOLKIT_DEBUG;

var cli = require('cli-define');
var define = cli.define;
var key = cli.key;
var Program = cli.Program;
var Option = cli.Option;
var Command = cli.Command;

var errors = clierr.errors;
var ErrorDefinition = clierr.ErrorDefinition;
var CliError = clierr.CliError;

var __middleware__;

var defaults = {
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
  exit: true,
  stash: null,
  bin: null,
  env: null,
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
      usage: {
        command: 'command',
        option: 'option',
        args: 'args'
      },
      bugs: 'Report bugs to %s.'
    }
  },
  trace: undefined,
  unknown: true,
  strict: false,
  middleware: null,
  error: null,
  manual: null
}

var all = [
  middlewares.error,
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
  middlewares.env,
  middlewares.rc,
  middlewares.multiple,
  middlewares.merge,
  middlewares.convert,
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
    e = err.toError(source);
    if(!source) e.shift();
    e.parameters = parameters || [];
    e.key = err.key;
  }else if(err instanceof Error) {
    e = new CliError(err, code, parameters);
    e.key = err.key || errors.EGENERIC.key;
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
  this.emit('error', e, errors);
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
        nm = cname(closure);
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
  if(logger) {
    var args = e.parameters.slice(0);
    args.unshift(e.message);
    this.log.error.apply(this.log, args);
    if(trace) {
      // NOTE: prefer the stack of a source error
      // TODO: make this configurable
      var stack = e._source && e._source.stack ?
        e._source.stack : e.stack;
      if(stack) {
        this.log.error(stack.split('\n').slice(1).join('\n'));
      }
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
  if(conf && conf.error && typeof conf.error === 'object') {
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
function parse(args) {
  if(debug) syslog.trace(circular.stringify(this, 2));
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
  var req = {argv: args}, name;
  function exec() {
    var func = list[i];
    name = cname(func);
    if(debug) {
      syslog.trace('middleware/start: %s', name);
      syslog.trace(circular.stringify(req, 2));
    }
    //console.dir(func);
    //console.log('' + func);
    func.call(scope, req, next);
    //console.log('' + func);
    //console.log('file %s', scope.file);
  }
  function next(err, parameters, e) {
    if(debug) {
      syslog.trace('middleware/end: %s', name);
    }
    //console.log('next being called ... with %s', err);
    //console.log(new Error().stack);
    if(err === null) {
      // halt processing, complete never fires
      return;
    }else if(err === true) {
      return scope.emit('complete', req);
    }else if(err) {
      req.error = scope.wrap(err, parameters, e);
      scope.raise(err, parameters, e);
    }
    i++;
    if(i < list.length) {
      exec();
    }else{
      scope.emit('complete', req);
    }
  }
  if(list.length) exec();
}

module.exports = function(package, name, description, options) {
  options = options || {};
  var locales = path.join(__dirname, 'lib', 'error', 'locales');
  clierr.file({locales: locales});
  var program = cli(package, name, description, CommandProgram);
  var listeners = process.listeners('uncaughtException');
  if(!listeners.length) {
    process.on('uncaughtException', function(err) {
      err.code = errors.EUNCAUGHT.code;
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

module.exports.defaults = defaults;
module.exports.middleware = middlewares;
module.exports.doc = require('./lib/help');
module.exports.help = middlewares.help.action;
module.exports.version = middlewares.version.action;
module.exports.types = types;
module.exports.error = require('./lib/error');
module.exports.CommandProgram = CommandProgram;
module.exports.log = syslog;
