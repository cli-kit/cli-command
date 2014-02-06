var cli = require('cli-define');
var Flag = cli.Flag;

var handler = require('./doc');

/**
 *  Adds a help flag to the program.
 *
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 */
module.exports = function (name, description, action) {
  if(typeof name == 'function') {
    action = name;
    name = null;
  }
  action = action || handler;
  name = name || '-h --help';
  var flag = new Flag(
    name, description || 'print usage information', {action: action});
  flag.key('helpopt');
  this.flag(flag);
  return this;
}

module.exports.action = handler;
