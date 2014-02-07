var alias = require('../util/alias');

/**
 *  Searches the raw arguments looking for the first argument
 *  that matches a known command and invokes an action associated
 *  with the command.
 */
module.exports = function(){
  return function command(req, next) {
    if(!arguments.length) return;
    //console.log('testing for command..');
    var z, i, raw = req.result.raw.slice(0), action, cmd, arg, ind;
    for(i = 0;i < raw.length;i++) {
      cmd = raw[i]; arg = alias(cmd, this._commands);
      if(arg) {
        raw.splice(i, 1);
        action = arg.action();
        if(typeof action == 'function') {
          ind = req.args.indexOf(cmd);
          if(~ind) req.args.splice(ind, 1);
          action.call(this, arg, req.result.all, raw);
          break;
        }
      }
    }
    next();
  }
}
