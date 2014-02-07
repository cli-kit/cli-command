/**
 *  Utility to determine is an argument value corresponds
 *  to a known command name (alias).
 *
 *  @param cmd The argument string.
 *  @param commands The list of known commands.
 */
module.exports = function alias(cmd, commands) {
  var z, arg;
  for(z in commands) {
    arg = commands[z];
    if(~arg.names().indexOf(cmd)) {
      return arg;
    }
  }
}
