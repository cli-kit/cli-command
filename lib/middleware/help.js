var cli = require('cli-define');
var Flag = cli.Flag;

var env = require('cli-env');
var handler = require('cli-help');

var environ;

/**
 *  Adds a help flag to the program.
 *
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 *  @param disable A boolean that disables loading help
 *  configuration from the environment.
 */
module.exports = function help(name, description, action, disable) {
  var conf = this.configure()
    , config = conf.help || {}
    , z, ignore

  if(!disable && !environ) {

    // initialize help configuration
    // from the environment
    environ = env({
      prefix: 'cli_toolkit_help',
      match: /^cli_toolkit_help_/i,
      initialize: true,
      native: true
    });
    ignore = ['sections', 'messages', 'titles'];
    for(z in environ) {
      if(~ignore.indexOf(z)) continue;
      conf.help[z] = environ[z];
    }
  }

  if(typeof name == 'function') {
    action = name;
    name = null;
  }

  name = name || config.name;
  description = description || config.description;
  action = action || config.action || handler;

  var flag = new Flag(name, description, {action: action});
  flag.key('helpopt');
  //flag.value(undefined);
  this.flag(flag);
  return this;
}

module.exports.action = handler;
