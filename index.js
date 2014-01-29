var path = require('path'), dirname = path.dirname, basename = path.basename;
var spawn = require('child_process').spawn;
var cli = require('cli-define');
var parser = require('cli-argparse');

var actions = {
  help: require('./lib/help'),
  version: require('./lib/version')
}

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

function merge(target) {
  var k, v, arg;
  for(k in target) {
    arg = this._arguments[k];
    v = target[k];
    if(typeof arg._converter == 'function') {
      v = arg._converter(v);
    }
    this[k] = arg.value = v;
  }
}

function builtins() {
  var i, action, fn, arr = Object.keys(actions);
  for(i = 0;i < arr.length;i++) {
    action = arr[i];
    if(this._args.flags[action]) {
      fn = this._arguments[action].action || actions[action];
      return fn.call(this);
    }
  }
}

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

function parse(args) {
  var config = configuration.call(this);
  //console.dir(config);
  this._args = parser(args, config);
  merge.call(this, this._args.flags);
  merge.call(this, this._args.options);
  builtins.call(this);
  command.call(this);
  //console.dir(this._args);
}

module.exports = function(package, name, description) {
  var program = cli(package, name, description);
  program.parse = parse;
  return program;
}
