var path = require('path'), dirname = path.dirname, basename = path.basename;
var spawn = require('child_process').spawn;
var cli = require('cli-define');
var parser = require('cli-argparse');

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
  if(this._arguments[key] && this._arguments[key].action) {
    return this._arguments[key].action;
  }
  return fn;
}

/**
 *  Retrieve a configuration suitable for passing to
 *  the arguments parser.
 */
function configuration() {
  var config = {alias: {}, flags: [], options: []}, k, arg;
  for(k in this._arguments) {
    arg = this._arguments[k];
    if(arg.key) {
      config.alias[arg._names.join(' ')] = arg.key;
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
 *  Merge parsed arguments into the program.
 *
 *  @param target The target object encapsulated by
 *  the argument parsing result object.
 */
function merge(target) {
  var k, v, arg;
  for(k in target) {
    arg = this._arguments[k];
    //console.log('%s %s', k, arg);
    if(arg) {
      v = target[k];
      if(typeof arg._converter == 'function') {
        v = arg._converter(v);
      }
      this[k] = arg.value = v;
    }
  }
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
 *  Execute a command as an external program.
 *
 *  @param argv The program arguments.
 *  @param cmd The command to execute.
 *  @param args Array of arguments to pass to the command.
 */
function execute(argv, cmd, args) {
  var dir = dirname(argv[1]);
  var bin = basename(argv[1]) + '-' + cmd;
  var local = path.join(dir, bin);
  var ps = spawn(local, args, {stdio: 'inherit'});
  ps.on('error', function(err){
    if(err.code == 'ENOENT') {
      console.error('%s(1) does not exist, try --help', bin);
    }else if (err.code == 'EACCES') {
      console.error('%s(1) not executable, try chmod or run with root', bin);
    }
  });
  ps.on('close', function (code, signal) {
    // NOTE: workaround for https://github.com/joyent/node/issues/3222
    // NOTE: assume child process exited gracefully on SIGINT
    if(signal == 'SIGINT') {
      process.exit(0);
    }
    process.exit(code);
  });
}

/**
 *  Searches the raw arguments looking for the first argument
 *  that matches a known command and either executed the command
 *  as an external program or invokes an action associated
 *  with the command.
 */
function command() {
  var z, i, raw = this._args.raw.slice(0), action, cmd, arg;
  for(i = 0;i < raw.length;i++) {
    cmd = raw[i]; arg = this._commands[cmd];
    if(arg) {
      raw.splice(i, 1);
      if(!arg._action) {
        return execute.call(this, process.argv, cmd, raw);
      }else if(arg._action) {
        return arg._action.call(this, arg, raw);
      }
    }
  }
}

/**
 *  Parse the supplied arguments and execute any commands
 *  found in the arguments, preferring the built in commands
 *  for help and version.
 */
function parse(args) {
  var config = configuration.call(this), handled;
  this._args = parser(args, config);
  this.args = this._args.unparsed;
  if(!this._args.raw.length && typeof this._action == 'function') {
    return this._action.call(this, this,
      handler.call(this, 'help'), handler.call(this, 'version'));
  }
  merge.call(this, this._args.flags);
  merge.call(this, this._args.options);
  handled = builtins.call(this);
  if(!handled) command.call(this);
}

module.exports = function(package, name, description) {
  var program = cli(package, name, description);
  program.parse = parse;
  return program;
}
