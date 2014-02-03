var fs = require('fs');
var path = require('path'),
  dirname = path.dirname,
  basename = path.basename;
var spawn = require('child_process').spawn;
var cli = require('cli-define');
var parser = require('cli-argparse');
var codes = require('./lib/codes');
var types = require('./lib/types');
var clierr = require('cli-error');
var conflict = require('./lib/conflict');

var ArgumentTypeError = types.ArgumentTypeError;
var Program = cli.Program;
var ErrorDefinition = clierr.ErrorDefinition;
var CliError = clierr.CliError;

var errors = clierr.errors;
var config = {
  exit: true,
  stash: null,
  bin: null
}

var actions = {
  help: require('./lib/help'),
  version: require('./lib/version')
}

Program.prototype.errors = errors;
Program.prototype.args = [];

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
 *  Retrieve the converter reference for an argument,
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

/**
 *  Attempts to retrieve string names from the functions or
 *  constructors specified as converter(s).
 *
 *  @param arg The argument definition.
 *
 *  @return An array of names.
 */
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
  var receiver = this;
  var config = this.configuration();
  if((typeof(config.stash) == 'string') && config.stash.length) {
    receiver = this[config.stash] = {};
  }
  var k, v, arg, re = /^no/;
  for(k in target) {
    arg = this._arguments[k];
    //console.log('%s %s', k, arg);
    if(arg) {
      v = target[k];
      if(arg.multiple && !Array.isArray(v)) {
        v = [v];
      }else if(!arg.multiple && Array.isArray(v)) {
        raise.call(this, errors.EMULTIPLE,
          [arg.names.join(' | '), v.join(', ')], {arg: arg, value: v});
      }
      v = coerce.call(this, arg, v);
      receiver[k] = options[k] = arg.value = v;
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
      raise.call(this, errors.EREQUIRED, [arg.names.join(' | ')], {arg: arg});
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
    var e = err.toError();
    e.shift();
    e.parameters = parameters || [];
    e.key = err.key;
    e.data = data;
    if(data && data.error) e.source = data.error;
  }
  //}else{
    //e = new CliError(e, errors.EUNCAUGHT.code);
    ////e.shift();
  //}
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
 *  Default error handler for the error event.
 *
 *  @param e The error instance.
 */
Program.prototype.error = function(e) {
  var key = (e.key || '').toLowerCase();
  var trace = key == 'euncaught' ? true : false;
  e.error(trace);
  if(this._configuration.exit) e.exit();
}

/**
 *  Assigns configuration information to the program.
 *
 *  @param conf The program configuration.
 */
Program.prototype.configuration = function(conf) {
  if(!arguments.length) return this._configuration;
  // TODO: check the *stash* property does not conflict
  // TODO: merge with the default configuration
  this._configuration = conf;
  //console.dir(config);
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
Program.prototype.parse = function(args) {
  args = args || process.argv.slice(2);
  var listeners = this.listeners('error');
  if(!listeners.length) {
    this.on('error', function(e) {
      var key = (e.key || '').toLowerCase();
      if(this.listeners(key).length) return this.emit(key, e, errors);
      this.error(e, errors);
    })
  }
  //return console.dir(this);

  conflict.call(this, Object.keys(actions));
  //this._config = options || {};
  var config = getParserConfiguration.call(this), handled;
  this._args = parser(args, config);
  this._args.config = config;
  this.args = this._args.unparsed;
  var opts = {};
  merge.call(this, this._args.flags, opts);
  merge.call(this, this._args.options, opts);
  handled = builtins.call(this);
  if(!handled) handled = required.call(this);
  if(!args.length) return empty.call(this);
  if(!Object.keys(this._commands).length) return this.emit('run');
  if(!handled) return command.call(this, opts);
}

module.exports = function(package, name, description, configuration) {
  var locales = path.join(__dirname, 'lib', 'error', 'locales');
  clierr.file({locales: locales}, function (err, file, errors, lang) {
    //console.dir(err);
    //console.log('loaded %s', file);
    //console.dir(errors);
  });
  var program = cli(package, name, description);
  program.configuration(configuration || config);
  var listeners = process.listeners('uncaughtException');
  if(!listeners.length) {
    process.on('uncaughtException', function(err) {
      //console.error(err);
      raise.call(program, errors.EUNCAUGHT, [err.message], {error: err});
    })
  }
  clierr({name: program.name});
  return program;
}

module.exports.types = types;
module.exports.ArgumentTypeError = ArgumentTypeError;
