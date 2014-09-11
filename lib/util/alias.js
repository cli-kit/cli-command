/**
 *  Utility to determine is an argument value corresponds
 *  to a known command name (alias).
 *
 *  @param cmd The argument string.
 *  @param commands The list of known commands.
 */
module.exports = function alias(cmd, commands, options) {
  options = options || {};
  var z, arg, k, v;
  for(z in commands) {
    arg = commands[z];
    if(~arg.names().indexOf(cmd)) {
      return arg;
    }
    if(options.recurse && Object.keys(arg.commands()).length) {
      for(k in arg.commands()) {
        v = arg.commands()[k];
        if(~v.names().indexOf(cmd)) {
          return v;
        }
      }
    }
  }
}
