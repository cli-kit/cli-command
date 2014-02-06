/**
 *  Assign a value to an option.
 *
 *  @param arg The argument definition.
 *  @param key The option key.
 *  @param value The value for the option.
 *  @param options An additional object to
 *  receive the value (optional).
 */
module.exports = function assign(arg, key, value, options) {
  //console.log('assigning %s', arg.key());
  // NOTE: this clause prevents flags with actions from
  // NOTE: being assigned to the receiver such that
  // NOTE: versionopt and helpopt do not appear
  if(arg.action()) return false;
  var receiver = this.getReceiver();
  receiver[key] = value;
  arg.value(value);
  if(options) options[key] = value;
}

