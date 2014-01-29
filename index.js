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
      config.alias[arg.name] = arg.key;
    }
    if(arg instanceof cli.Flag) {
      config.flags = config.flags.concat(arg.names);
    }else if(arg instanceof cli.Option) {
      config.options = config.options.concat(arg.names);
    }
  }
  //console.dir(config);
  return config;
}

function merge() {
  var z;
  for(z in this._args.flags) {
    this[z] = this._args.flags[z];
  }
  for(z in this._args.options) {
    this[z] = this._args.options[z];
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

function parse(args) {
  var config = configuration.call(this);
  this._args = parser(args, config);
  merge.call(this);
  builtins.call(this);
}

module.exports = function(package, name, description) {
  var program = cli(package, name, description);
  program.parse = parse;
  return program;
}
