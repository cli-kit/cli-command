var alias = require('../util/alias');

/**
 *  Searches the raw arguments looking for the first argument
 *  that matches a known command and invokes an action associated
 *  with the command.
 */
module.exports = function(){
  return function command(req, next) {
    if(!arguments.length) return;
    function callback(obj) {
      // proceed to next middleware
      if(!arguments.length) {
        return next();
      // stop middleware execution
      }else if(obj === null || typeof obj === 'boolean') {
        return next(obj);
      // execute subcommand
      }else if(obj && typeof obj === 'object') {
        console.log('invoke subcommand');
      }
      // error raised
      next.apply(null, arguments);
    }
    var z, i, raw = req.result.raw.slice(0), action, cmd, arg, ind;
    for(i = 0;i < raw.length;i++) {
      cmd = raw[i]; arg = alias(cmd, this._commands);
      if(arg) {
        raw.splice(i, 1);
        action = arg.action();
        if(typeof action == 'function') {
          ind = req.args.indexOf(cmd);
          req.args.splice(ind, 1);
          req.command = {name: cmd, cmd: arg, args: raw};
          action.call(this, req.command, req, callback);
          return false;
        }
      }
    }
    next();
  }
}
