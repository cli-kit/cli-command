var Flag = require('cli-define').Flag;

/**
 *  Assign a value to an option.
 *
 *  @param arg The argument definition.
 *  @param key The option key.
 *  @param value The value for the option.
 */
module.exports = function assign(arg, key, value) {
  if(value === undefined) return false;
  var receiver = this.getReceiver();
  receiver[key] = value;
  if(arg) arg.value(value);
}

