var fs = require('fs');
var path = require('path'),
  dirname = path.dirname,
  basename = path.basename;
var spawn = require('child_process').spawn;
var util = require('util');
var cli = require('cli-define');
var define = cli.define;
var parser = require('cli-argparse');
var merger = require('cli-util').merge;
var codes = require('./lib/codes');
var types = require('./lib/types');
var clierr = require('cli-error');
var conflict = require('./lib/conflict');
var middlewares = require('./lib/middleware');

var ArgumentTypeError = require('./lib/error/argument-type');
var Program = cli.Program;
var Option = cli.Option;
var Flag = cli.Flag;
var ErrorDefinition = clierr.ErrorDefinition;
var CliError = clierr.CliError;

var errors = clierr.errors;
var defaults = {
  exit: true,
  stash: null,
  bin: null,
  env: null
}

var actions = {
  help: require('./lib/help'),
  version: require('./lib/version')
}

var CommandProgram = function() {
  Program.apply(this, arguments);
  // private
  define(this, '_middleware', undefined, true);
  define(this, '_configuration', merger(defaults, {}), false);

  // public
  define(this, 'errors', errors, false);
  define(this, 'args', [], true);

  // deprecated
  define(this, '__actions', Object.keys(actions), false);
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
 *  Define program middleware.
 */
function use(middleware) {
  if(this._middleware === undefined) this._middleware = [];
  //console.log(typeof(this._middleware));
  var args = [].slice.call(arguments, 1);
  if(typeof middleware != 'function') {
    throw new Error('Invalid middleware, must be a function');
  }
  var result = middleware.apply(this, args);
  if(typeof(result) == 'function') {
    this._middleware.push(result);
  }
  return this;
}
define(CommandProgram.prototype, 'use', use, false);

/**
 *  Execute middleware.
 */
function middleware(args) {
  var i = 0, list = this._middleware;
  var scope = this;
  var req = {program: this, argv: args};
  function exec() {
    var func = list[i];
    func.call(scope, req, next);
  }
  function next(err) {
    //console.log('next function called...');
    i++;
    if(i < list.length) {
      exec();
    }
  }
  exec();
}
define(CommandProgram.prototype, 'middleware', middleware, false);

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
  if(!arguments.length && this._arguments.version) return this._version;
  if(typeof semver == 'function') {
    action = semver;
    semver = null;
  }
  if(semver) this._version = semver;
  name = name || '-V --version';
  var flag = new Flag(
    name, description || 'print the program version', {action: action});
  flag.key('version');
  this.flag(flag);
  return this;
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
  if(typeof name == 'function') {
    action = name;
    name = null;
  }
  name = name || '-h --help';
  var flag = new Flag(
    name, description || 'print usage information', {action: action});
  flag.key('help');
  this.flag(flag);
  return this;
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
  var listeners = this.listeners('error');
  if(!listeners.length) {
    this.on('error', function(e) {
      var key = (e.key || '').toLowerCase();
      if(this.listeners(key).length) return this.emit(key, e, errors);
      this.error(e, errors);
    })
  }
  conflict.call(this);
  //var conf = this.configuration();
  var config = getParserConfiguration.call(this), handled;
  this._args = parser(args, config);
  this._args.config = config;
  unparsed.call(this);
  var opts = {};

  this.middleware(args);
  return;

  //values.call(this);
  //environ.call(this);
  //merge.call(this, this._args.flags, opts);
  //merge.call(this, this._args.options, opts);
  //initialize.call(this);
  ////handled = builtins.call(this);

  //if(!handled) handled = required.call(this);
  //if(!args.length) return empty.call(this);
  //if(!Object.keys(this._commands).length) return this.emit('run');
  //if(!handled) return command.call(this, opts);
}
define(CommandProgram.prototype, 'parse', parse, false);

/**
 *  Retrieve the handler for a built in action.
 *
 *  @param key The argument key.
 */
function handler(key) {
  var fn = actions[key];
  if(this._arguments[key] && this._arguments[key]._action) {
    return this._arguments[key]._action;
  }
  return fn;
}

/**
 *  Retrieve a configuration suitable for passing to
 *  the arguments parser.
 */
function getParserConfiguration() {
  var config = {
    alias: {}, flags: [], options: []}, k, arg, key, no = /^no/;
  for(k in this._arguments) {
    arg = this._arguments[k]; key = arg.key();
    if(key) {
      if(no.test(key)) {
        key = key.replace(no, '');
        key = key.charAt(0).toLowerCase() + key.slice(1);
      }
      config.alias[arg.names().join(' ')] = key;
    }
    if(arg instanceof cli.Flag) {
      config.flags = config.flags.concat(arg.names());
    }else if(arg instanceof cli.Option) {
      config.options = config.options.concat(arg.names());
    }
  }
  return config;
}

/**
 *  Retrieve the converter reference for an argument,
 *  respecting the type map.
 *
 *  @param arg The argument definition.
 *  @param func A specific function.
 */
function getConverter(arg, func) {
  var converter = func || arg.converter(), name;
  if(Array.isArray(converter)) return converter;
  try {
    name = new converter().constructor.name;
  }catch(e){}
  if(name && types.map[name]) return types.map[name];
  if(arg.converter() === JSON) return types.map.JSON;
  return converter;
}

/**
 *  Attempts to retrieve string names from the functions or
 *  constructors specified as converter(s).
 *
 *  @param arg The argument definition.
 *
 *  @return An array of names.
 */
function getConverterNames(arg) {
  var converter = arg.converter(), names = [], i, name;
  for(i = 0;i < converter.length;i++) {
    try{
      name = new converter[i]().constructor.name;
      if(name) name = name.toLowerCase();
      names.push(name);
    }catch(e){}
  }
  return names;
}

/**
 *  Convert an arguments value.
 *
 *  @param value The parsed argument value.
 *  @param arg The argument definition.
 *  @param index The index into an array (multiple only).
 */
function convert(value, arg, index) {
  var converter = getConverter(arg), i, func;
  function error(e, message, parameters) {
    if(e instanceof ArgumentTypeError) {
      if(e.code == 1) e.code = errors.ETYPE.code;
      e.key = errors.ETYPE.key;
      raise.call(this, e)
    }else{
      e = new ArgumentTypeError(e, e.parameters || [], errors.ETYPE.code);
      raise.call(this, e);
    }
  }
  function invoke(converter, fast) {
    try {
      value = converter.call(this, value, arg, index);
    }catch(e) {
      if(!fast) throw e;
      error.call(this, e);
    }
    return value;
  }
  if(Array.isArray(converter)) {
    for(i = 0;i < converter.length;i++) {
      func = getConverter(arg, converter[i]);
      try {
        return invoke.call(this, func, false);
      }catch(e) {
        // NOTE: all coercion attempts failed
        if(i == (converter.length -1)) {
          error.call(this, e, 'invalid type for %s, expected (%s)',
            [arg.names().join(' | '), getConverterNames(arg).join(', ')]);
        }
      }
    }
  }else{
    invoke.call(this, converter, true);
  }
  return value;
}

/**
 *  Coerce an argument value using an assigned converter
 *  function.
 *
 *  @param arg The argument definition.
 *  @param v The value as specified on the command line.
 */
function coerce(arg, v) {
  var type = false, i, scope = this;
  var converter = getConverter(arg);
  // NOTE: we check whether the converter is one of
  // NOTE: the built in converters as they are responsible
  // NOTE: for handling array values, other custom converters
  // NOTE: are invoked for each array entry if the argument
  // NOTE: value has already been converted to an array
  var keys = Object.keys(types);
  for(i = 0;i < keys.length;i++) {
    if(types[keys[i]] === converter) {
      type = true; break;
    }
  }
  if(typeof converter == 'function' || Array.isArray(converter)) {
    if(Array.isArray(v) && !type) {
      v.forEach(function(value, index, arr) {
        arr[index] = convert.call(scope, value, arg, index);
      });
    }else{
      v = convert.call(this, v, arg);
    }
  }
  return v;
}

/**
 *  Merge parsed arguments into the program.
 *
 *  @param target The target object encapsulated by
 *  the argument parsing result object.
 *  @param options An object that will receive the arguments
 *  being merged.
 */
function merge(target, options) {
  var receiver = this.getReceiver();
  var k, v, arg, re = /^no/;
  for(k in target) {
    arg = this._arguments[k];
    if(arg) {
      v = target[k];
      if(arg.multiple() && !Array.isArray(v)) {
        v = [v];
      }else if(!arg.multiple() && Array.isArray(v)) {
        raise.call(this, errors.EMULTIPLE,
          [arg.names().join(' | '), v.join(', ')], {arg: arg, value: v});
      }
      v = coerce.call(this, arg, v);
      assign.call(this, arg, k, v, options);
    }else{
      // TODO: handle unknown option here?
    }
  }
  return true;
}

/**
 *  Iterate over the options and ensure that the receiver
 *  (program or stash) has the default values.
 */
function values() {
  var receiver = this.getReceiver();
  var opts = this._arguments, k, v;
  for(k in opts) {
    v = opts[k].value();
    if(v !== undefined) {
      receiver[k] = v;
    }
  }
}

/**
 *  Assign a value to an option.
 *
 *  @param arg The argument definition.
 *  @param key The option key.
 *  @param value The value for the option.
 *  @param options An additional object to
 *  receive the value (optional).
 */
function assign(arg, key, value, options) {
  var receiver = this.getReceiver();
  receiver[key] = value;
  arg.value(value);
  if(options) options[key] = value;
}

/**
 *  Finds arguments specified as multiple and ensures
 *  that the value is an empty array if no arguments
 *  were specified that set the value.
 */
function initialize() {
  // TODO : initialize unset values from their defaults where applicable
  var arg, receiver = this.getReceiver();
  for(var z in this._arguments) {
    arg = this._arguments[z];
    if(arg.multiple() && arg.value() === undefined) {
      assign.call(this, arg, z, []);
    }
  }
}

/**
 *  Validate that required arguments are present.
 */
function required() {
  var z, arg;
  for(z in this._arguments) {
    arg = this._arguments[z];
    if(!arg.optional() && !this._args.options[arg.key()]) {
      raise.call(this, errors.EREQUIRED, [arg.names().join(' | ')], {arg: arg});
      return true;
    }
  }
  return false;
}

/**
 *  Execute builtin handlers for help and version.
 */
function builtins() {
  var i, action, fn, arr = Object.keys(actions);
  for(i = 0;i < arr.length;i++) {
    action = arr[i];
    if(this._args.flags[action]) {
      fn = handler.call(this, action);
      fn.call(this, actions[action]);
      return true;
    }
  }
  return false;
}

/**
 *  Raise an error from an error definition or error
 *  instance.
 *
 *  @param err The error definition.
 *  @param parameters The message replacement parameters.
 *  @param data Additional error data.
 */
function raise(err, parameters, data) {
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

/**
 *  Check file permissions.
 *
 *  canExecute():
 *  checkPermission (stat, 1);
 *
 *  canRead():
 *  checkPermission (stat, 4);
 *
 *  canWrite():
 *  checkPermission (stat, 2);
 */
// TODO: move to cli-util module
function permissions(stat, mask) {
  return !!(mask &
    parseInt((stat.mode & parseInt("777", 8)).toString (8)[0]));
}

/**
 *  Execute a command as an external program.
 *
 *  @param argv The program arguments.
 *  @param cmd The command to execute.
 *  @param args Array of arguments to pass to the command.
 */
function execute(argv, cmd, args) {
  var config = this.configuration();
  var scope = this;
  var dir = config.bin || dirname(argv[1]);
  var bin = this._name + '-' + cmd;
  var local = path.join(dir, bin);
  var exists = fs.existsSync(local);
  var data = {bin: bin, dir: dir, local: local, args: args};
  if(!exists) {
    return raise.call(this, errors.ENOENT, [bin], data);
  }
  var stat = fs.statSync(local);
  //var perms = stat.mode & 0777;
  //console.log('%s', perms);
  //console.log('%s', check(stat, 1));
  if(!permissions(stat, 1)) {
    return raise.call(this, errors.EPERM, [bin], data);
  }
  var ps = spawn(local, args, {stdio: 'inherit'});
  //ps.on('error', function(err){
    // NOTE: keep these tests just in case the above logic is wrong
    // NOTE: or quite likely fails on windows
    //if(err.code == 'ENOENT') {
      //raise.call(scope, codes.ENOENT, null, [bin, dir, local, args]);
    //}else if (err.code == 'EACCES') {
      //raise.call(scope, codes.EPERM, null, [bin, dir, local, args]);
    //}
  //});
  ps.on('close', function (code, signal) {
    // NOTE: workaround for https://github.com/joyent/node/issues/3222
    // NOTE: assume child process exited gracefully on SIGINT
    if(signal == 'SIGINT') {
      return process.exit(0);
    }
    // TODO: remove this event?
    scope.emit('close', code, signal);
    if(config.exit) process.exit(code);
  });
  return ps;
}

/**
 *  Searches the raw arguments looking for the first argument
 *  that matches a known command and either executes the command
 *  as an external program or invokes an action associated
 *  with the command.
 *
 *  @param options An object containing all flags and option values.
 */
function command(options) {
  var commands = this._commands;
  function find(cmd) {
    var z, arg;
    for(z in commands) {
      arg = commands[z];
      if(~arg.names().indexOf(cmd)) {
        return arg;
      }
    }
  }
  var z, i, raw = this._args.raw.slice(0), action, cmd, arg, ind;
  for(i = 0;i < raw.length;i++) {
    cmd = raw[i]; arg = find(cmd);
    if(arg) {
      raw.splice(i, 1);
      action = arg.action();
      if(!action) {
        return execute.call(this, process.argv, cmd, raw);
      }else if(action) {
        ind = this.args.indexOf(cmd);
        if(~ind) this.args.splice(ind, 1);
        return action.call(this, arg, options, raw);
      }
    }
  }
}

/**
 *  Emits the empty event.
 */
function empty() {
  // NOTE: this little dance allows custom help and version
  // NOTE: callbacks to invoke the original implementations
  // NOTE: from empty event listeners
  var help, version, _help, _version, scope = this;
  help = _help = handler.call(this, 'help');
  version = _version = handler.call(this, 'version');
  if(help != actions.help) {
    help = function() {
      _help.call(scope, actions.help);
    }
  }
  if(version != actions.version) {
    version = function() {
      _version.call(scope, actions.version);
    }
  }
  this.emit('empty', help, version);
}

/**
 *  Coerces unparsed arguments.
 *
 *  The resulting array is then assigned to the program
 *  for easy access.
 */
function unparsed() {
  var args = this._args.unparsed.slice(0);
  for(var i =0;i < args.length;i++) {
    args[i] = coerce.call(this, this, args[i]);
  }
  this.args = args;
}

/**
 *  Imports program-specific environment variables
 *  into the program.
 */
function environ() {
  var env = this.env(), z, receiver = this.getReceiver();
  var conf = this.configuration();
  if(!env && conf.env) {
    if(typeof conf.env.prefix != 'string') {
      conf.env.prefix = this.name();
    }
    if(!conf.env.match) {
      conf.env.match = new RegExp('^' + this.name() + '_');
    }
    conf.env.initialize = true;
    env = require('cli-env')(conf.env);
    this.env(env);
    var all = typeof(conf.env.merge) == 'string';
    if(conf.env.merge) {
      for(z in env) {
        if((z in this) && typeof(this[z]) == 'function') {
          return conflict.call(this, z, new Option(z));
        }
        if(!all && this._arguments[z]) {
          receiver[z] = env[z];
        }else if(conf.env.merge === true){
          receiver[z] = env[z];
        }
      }
    }
  }
}

module.exports = function(package, name, description, configuration) {
  var locales = path.join(__dirname, 'lib', 'error', 'locales');
  clierr.file({locales: locales});
  var program = cli(package, name, description, CommandProgram);
  program.configuration(configuration || defaults);
  var listeners = process.listeners('uncaughtException');
  if(!listeners.length) {
    process.on('uncaughtException', function(err) {
      //console.error(err);
      console.error(err.stack);
      raise.call(program, errors.EUNCAUGHT, [err.message], {error: err});
    })
  }
  // TODO: allow setting error configuration on the program configuration
  clierr({name: program.name()});
  return program;
}

module.exports.middleware = middlewares;
module.exports.types = types;
module.exports.ArgumentTypeError = ArgumentTypeError;
