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
  }

  // recurse after testing top-level
  if(options.recurse) {
    for(z in commands) {
      arg = commands[z];
      if(Object.keys(arg.commands()).length) {
        v = alias(cmd, arg.commands(), options);
        if(v) {
          return v;
        }
      }
    }
  }
}
