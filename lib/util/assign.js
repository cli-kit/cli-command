/**
 *  Assign a value to an option.
 *
 *  @param arg The argument definition.
 *  @param key The option key.
 *  @param value The value for the option.
 */
module.exports = function assign(arg, key, value) {
  var receiver = this.configure().stash;
  receiver[key] = value;
  if(arg) arg.value(value);
}
