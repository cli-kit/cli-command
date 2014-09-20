/**
 *  Utility to walk a program and fetch all commands into an array.
 *
 *  @param cmd The argument string.
 *  @param commands The list of known commands.
 */
module.exports = function commands(cli, opts, list, depth) {
  cli = cli || this;
  opts = opts || {};
  list = list || [];
  depth = depth !== undefined ? depth : 1;
  var cmds = cli.commands() || {}, z, arg;
  for(z in cmds) {
    arg = cmds[z];
    list.push(arg);
    if(!opts.max) {
      commands(arg, opts, list, ++depth);
    }else if(opts.max && depth < opts.max) {
      //console.log('recursing on max %s %s', opts.max, depth);
      commands(arg, opts, list, ++depth);
      --depth;
    }
  }
  return list;
}
