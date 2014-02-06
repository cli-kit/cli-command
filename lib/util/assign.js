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
  var receiver = this.getReceiver();
  receiver[key] = value;
  arg.value(value);
  if(options) options[key] = value;
}

