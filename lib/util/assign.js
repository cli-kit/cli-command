var Flag = require('cli-define').Flag;

/**
 *  Assign a value to an option.
 *
 *  @param arg The argument definition.
 *  @param key The option key.
 *  @param value The value for the option.
 */
module.exports = function assign(arg, key, value) {
  // NOTE: this clause prevents flags with actions from
  // NOTE: being assigned to the receiver such that
  // NOTE: versionopt and helpopt do not appear
  if(arg && arg.action() && (arg instanceof Flag)) return false;
  var receiver = this.getReceiver();
  receiver[key] = value;
  if(arg) arg.value(value);
}

