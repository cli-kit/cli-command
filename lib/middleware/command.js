var path = require('path');
var alias = require('../util/alias');
var Command = require('cli-define').Command;
var ErrorDefinition = require('cli-error').ErrorDefinition;

function getModulePath(cmd) {
  if(cmd.parent() === this) {
    return cmd.key();
  }else{
    // build name from all parent commands
    var p = cmd.parent();
    var list = [];
    while(p !== this) {
      list.push(p.key());
      p = p.parent();
    }
    list.reverse();
    list.push(cmd.key());
    return path.join.apply(path, list);
  }
}

// lazily load a command action definition from a module
function lazy(arg) {
  var conf = this.configure();
  var action = arg.action();
  if(!conf.command.dir || action !== undefined) return false;
  var file = path.join(conf.command.dir, getModulePath.call(this, arg))
  try{
    action = require(file);
    if(typeof action !== 'function') {
      return this.raise(this.errors.ECMD_TYPE, [file]);
    }
    arg.action(action);
  }catch(e) {
    return this.raise(this.errors.ECMD_REQUIRE, [file], e);
  }
}

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
        return arg.call(this, req.command, req, next);
      }else if(arg instanceof Command) {
        lazy.call(this, arg);
        var action = arg.action();
        if(typeof action === 'function') {
          return action.call(this, req.command, req, next);
        }
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
module.exports = function() {
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
    var i, raw = req.result.raw.slice(0), action, cmd, arg, ind, file;
    for(i = 0;i < raw.length;i++) {
      cmd = raw[i]; arg = alias(cmd, this._commands);
      //console.log('testing for command with %s', cmd);
      if(arg) {
        raw.splice(i, 1);
        lazy.call(this, arg);
        action = arg.action();
        if(typeof action == 'function') {
          ind = req.args.indexOf(cmd);
          //req.args.splice(ind, 1);
          req.command = {name: cmd, cmd: arg, args: raw};
          //console.dir(req.command);
          action.call(this, req.command, req, callback);
          return false;
        }
      }
    }
    next();
  }
}
