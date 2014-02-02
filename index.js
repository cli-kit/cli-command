var fs = require('fs');
var path = require('path'), dirname = path.dirname, basename = path.basename;
var spawn = require('child_process').spawn;
var cli = require('cli-define');
var Program = cli.Program;
var parser = require('cli-argparse');
var codes = require('./lib/codes');
var exception = require('./lib/error');
var types = require('./lib/types');
var ArgumentTypeError = types.ArgumentTypeError;
var clierr = require('cli-error');

Program.prototype.exception = exception;

var actions = {
  help: require('./lib/help'),
  version: require('./lib/version')
}

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
function configuration() {
  var config = {alias: {}, flags: [], options: []}, k, arg, key, no = /^no/;
  for(k in this._arguments) {
    arg = this._arguments[k]; key = arg.key;
    if(key) {
      if(no.test(key)) {
        key = key.replace(no, '');
        key = key.charAt(0).toLowerCase() + key.slice(1);
      }
      config.alias[arg._names.join(' ')] = key;
    }
    if(arg instanceof cli.Flag) {
      config.flags = config.flags.concat(arg._names);
    }else if(arg instanceof cli.Option) {
      config.options = config.options.concat(arg._names);
    }
  }
  return config;
}

/**
 *  Retrievet the converter reference for an argument,
 *  respecting the type map.
 *
 *  @param arg The argument definition.
 *  @param func A specific function.
 */
function getConverter(arg, func) {
  var converter = func || arg._converter, name;
  if(Array.isArray(converter)) return converter;
  try {
    name = new converter().constructor.name;
  }catch(e){}
  if(name && types.map[name]) return types.map[name];
  if(arg._converter === JSON) return types.map.JSON;
  return converter;
}

function getConverterNames(arg) {
  var converter = arg._converter, names = [], i, name;
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
      raise.call(this, codes.ETYPE,
        message || e.message, parameters || e.parameters);
      // TODO: raise.call(this, e)
    }else{
      // pass down as uncaught exception
      throw e;
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
            [arg.names.join(' | '), getConverterNames(arg).join(', ')]);
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
  var type = false, i;
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
        arr[index] = convert.call(this, value, arg, index);
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
  var k, v, arg, re = /^no/;
  for(k in target) {
    arg = this._arguments[k];
    //console.log('%s %s', k, arg);
    if(arg) {
      v = target[k];
      if(arg.multiple && !Array.isArray(v)) {
        v = [v];
      }else if(!arg.multiple && Array.isArray(v)) {
        raise.call(this, codes.EMULTIPLE, null, [arg, v]);
      }
      v = coerce.call(this, arg, v);
      // TODO: validate at this point?
      this[k] = options[k] = arg.value = v;
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
    if(!arg.optional && !this._args.options[arg.key]) {
      raise.call(this, codes.EREQUIRED, null, [arg]);
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
 *  Raise an error.
 */
function raise(code, message, parameters) {
  return exception.call(this, code, codes, message, parameters);
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
  var scope = this;
  var dir = this._config.bin || dirname(argv[1]);
  var bin = this._name + '-' + cmd;
  var local = path.join(dir, bin);
  var exists = fs.existsSync(local);
  if(!exists) {
    return raise.call(this, codes.ENOENT, null, [bin, dir, local, args]);
  }
  var stat = fs.statSync(local);
  //var perms = stat.mode & 0777;
  //console.log('%s', perms);
  //console.log('%s', check(stat, 1));
  if(!permissions(stat, 1)) {
    return raise.call(this, codes.EPERM, null, [bin, dir, local, args]);
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
    scope.emit('close');
    process.exit(code);
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
  var z, i, raw = this._args.raw.slice(0), action, cmd, arg, ind;
  for(i = 0;i < raw.length;i++) {
    cmd = raw[i]; arg = this._commands[cmd];
    if(arg) {
      raw.splice(i, 1);
      if(!arg._action) {
        return execute.call(this, process.argv, cmd, raw);
      }else if(arg._action) {
        ind = this.args.indexOf(cmd);
        if(~ind) this.args.splice(ind, 1);
        return arg._action.call(this, arg, options, raw);
      }
    }
  }
}

/**
 *  Invokes an action handler on the program if zero arguments
 *  were passed to the program.
 */
function zero() {
  if(!this._args.raw.length && typeof this._action == 'function') {
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
    return this._action.call(this, this, help, version);
  }
}

/**
 *  Register a custom error callback.
 *
 *  @param cb The callback function.
 */
function error(cb) {
  this._error = cb;
  return this;
}

/**
 *  Register a function to start program execution.
 *
 *  @param cb The callback function.
 */
function run(cb) {
  this._run = cb;
  return this;
}

/**
 *  Parse the supplied arguments and execute any commands
 *  found in the arguments, preferring the built in commands
 *  for help and version.
 *
 *  @param args The arguments to parse, default is process.argv.slice(2).
 *  @param options Configuration options.
 */
function parse(args, options) {
  this._config = options || {};
  var config = configuration.call(this), handled;
  this._args = parser(args, config);
  this._args.config = config;
  this.args = this._args.unparsed;
  var opts = {};
  merge.call(this, this._args.flags, opts);
  merge.call(this, this._args.options, opts);
  zero.call(this);
  handled = builtins.call(this);
  if(!handled) handled = required.call(this);
  if(this._run
     && !Object.keys(this._commands).length) return this._run.call(this);
  if(!handled) return command.call(this, opts);
}

module.exports = function(package, name, description) {
  var locales = path.join(__dirname, 'lib', 'error', 'locales');
  clierr.file({locales: locales}, function (err, file, errors, lang) {
    console.dir(err);
    console.log('loaded %s', file);
    console.dir(errors);
  });

  var program = cli(package, name, description);
  process.on('uncaughtException', function(err) {
    raise.call(program, codes.EUNCAUGHT, null, [err]);
  })
  program.error = error;
  program.parse = parse;
  program.run = run;
  return program;
}

module.exports.types = types;
