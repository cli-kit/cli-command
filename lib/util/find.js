/**
 *  Find an argument defined at the program level or
 *  as assigned to a top-level command.
 */
// TODO: make this truly recursive
module.exports = function find(key) {
  if(this._options[key]) return this._options[key];
  var cmds = this.commands(), z, cmd, opts;
  for(z in cmds) {
    cmd = cmds[z];
    opts = cmd.options();
    if(opts[key]) return opts[key];
  }
}

