var alias = require('../util/alias');
var ErrorDefinition = require('cli-error').ErrorDefinition;

function invoke(obj, req, next) {
  var keys = Object.keys(obj);
  if(!keys.length) return next();
  var i, key, arg, info;
  for(i = 0;i < keys.length;i++) {
    key = keys[i];
    arg = obj[key];
    if(key === req.command.args[0]) {
      req.command.parents = req.command.parents || [];
      req.command.parents.push(req.command.name);
      req.command.name = key;
      req.command.args.shift();
      if(typeof arg === 'function') {
        //console.log('got subcommand function' + arg);
        return arg.call(this, req.command, req, next);
      }else if(arg instanceof Command) {
        // TODO: handle subcommand instances here
      }
    }
  }
  return next();
}

/**
 *  Searches the raw arguments looking for the first argument
 *  that matches a known command and invokes an action associated
 *  with the command.
 */
module.exports = function(){
  return function command(req, next) {
    if(!arguments.length) return;
    var scope = this;
    function callback(obj) {
      //console.dir('callback');
      //console.dir(arguments);

      // proceed to next middleware
      if(!arguments.length) {
        return next();
      // stop middleware execution
      }else if((obj instanceof Error)
        || (obj instanceof ErrorDefinition)
        || typeof obj === 'string') {
        // error raised
        return next.apply(null, arguments);
      }else if(obj === null || typeof obj === 'boolean') {
        return next(obj);
      // execute subcommand
      }else if(obj
        && typeof obj === 'object' && !Array.isArray(obj)) {
        // TODO: allow passing of subcommand object map
        // TODO: and subcommands associated with the command
        return invoke.call(scope, obj, req, callback);
      }else if(Array.isArray(obj)) {
        return next(scope.errors.ECMD_ARRAY);
      }
      // unknown response
      next.apply(null, arguments);
    }
    var i, raw = req.result.raw.slice(0), action, cmd, arg, ind;
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
