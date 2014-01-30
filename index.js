var fs = require('fs');
var path = require('path'), dirname = path.dirname, basename = path.basename;
var spawn = require('child_process').spawn;
var cli = require('cli-define');
var parser = require('cli-argparse');
var codes = require('./lib/codes');
var exception = require('./lib/exception');

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
 *  Raise an error.
 */
function raise(code, parameters) {
  var fn = this._error || exception;
  if(fn == this._error) {
    return fn.call(this, code, codes, parameters, exception);
  }
  return fn.call(this, code, codes, parameters);
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

  //var exists = fs.existsSync(local);
  //if(!exists) {
    //return console.error('%s(1) does not exist, try --help', bin);
  //}
  //var stat = fs.statSync(local);
  //var perms = stat.mode & 0777;
  //console.log('%s', perms);

  // NOTE: this is kind of weird, what we want to do is
  // NOTE: is suppress the execvp() error message so that
  // NOTE: we can present our own message however the only
  // NOTE: way to do that is to pipe stderr
  // NOTE: the additional option is for compatibility with
  // NOTE: the ttycolor module as the child process stderr is not
  // NOTE: a tty we need to let it know how to behave
  var c = process.stderr.isTTY ? '--color' : '--no-color';
  args.push(c);
  var ps = spawn(local, args, {stdio: [0, 1, 'pipe']});
  ps.on('error', function(err){
    if(err.code == 'ENOENT') {
      raise.call(this, codes.ENOENT, [bin, dir, local, args]);
    }else if (err.code == 'EACCES') {
      raise.call(this, codes.EPERM, [bin, dir, local, args]);
    }
  });
  ps.stderr.on('data', function (data) {
    if(!/^execvp\(\)/.test(data)) {
      process.stderr.write(data);
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
  return ps;
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
 */
function error(cb) {
  this._error = cb;
  return this;
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
  merge.call(this, this._args.flags);
  merge.call(this, this._args.options);
  zero.call(this);
  handled = builtins.call(this);
  if(!handled) return command.call(this);
}

module.exports = function(package, name, description) {
  var program = cli(package, name, description);
  process.on('uncaughtException', function(err) {
    raise.call(program, codes.EUNCAUGHT, [err]);
  })
  program.error = error;
  program.parse = parse;
  return program;
}
