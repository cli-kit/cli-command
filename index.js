var cli = require('cli-define');
var parser = require('cli-argparse');

function configuration(program) {
  var config = {alias: {}, flags: [], options: []}, k, arg;
  for(k in program._arguments) {
    arg = program._arguments[k];
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

function merge(cli) {
  var z;
  for(z in cli._args.flags) {
    cli[z] = cli._args.flags[z];
  }
  for(z in cli._args.options) {
    cli[z] = cli._args.options[z];
  }
}

function parse(args) {
  var config = configuration(this);
  this._args = parser(args, config);
  merge(this);
  //console.dir(this);
}

module.exports = function(package, name, description) {
  var program = cli(package, name, description);
  program.parse = parse;
  return program;
}
