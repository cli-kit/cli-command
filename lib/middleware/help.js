var cli = require('cli-define');
var Flag = cli.Flag;

var env = require('cli-env');
var handler = require('../help');

/**
 *  Adds a help flag to the program.
 *
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 *  @param disable A boolean that disables loading help
 *  configuration from the environment.
 */
module.exports = function (name, description, action, disable) {
  if(!disable) {
    // initialize help configuration
    // from the environment
    var conf = this.configure();
    var environ = env({
      prefix: 'cli_toolkit_help',
      match: /^cli_toolkit_help_/i,
      initialize: true,
      native: true
    });
    var ignore = ['sections', 'messages', 'titles'];
    for(var z in environ) {
      if(~ignore.indexOf(z)) continue;
      conf.help[z] = environ[z];
    }
  }

  if(typeof name == 'function') {
    action = name;
    name = null;
  }
  action = action || handler;
  name = name || '--help';

  var flag = new Flag(
    name, description || 'display this help and exit', {action: action});
  flag.key('helpopt');
  //flag.value(undefined);
  this.flag(flag);
  return this;
}

module.exports.action = handler;
