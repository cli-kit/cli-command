var path = require('path');
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
    return this.raise(this.errors.ECMD_REQUIRE, [file, e.message], e);
  }
}

function invoke(obj, req, next) {
  var keys = Object.keys(obj);
  if(!keys.length) return next();
  var i, key, arg, names;
  for(i = 0;i < keys.length;i++) {
    key = keys[i];
    arg = obj[key];
    names = arg.names();
    //console.log('invoke subcommand %s, %s', key, arg.toString(null));
    if(~names.indexOf(req.command.args[0])) {
      req.command.parents = req.command.parents || [];
      req.command.parents.push(req.command.name);
      req.command.name = key;
      req.command.args.shift();
      req.command.cmd = arg;
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
    var scope = this
      , conf = this.configure()
      , alias = this.finder.getCommandByName;
    function callback(obj) {
      //console.dir('callback');
      //console.dir(arguments.length);
      //console.dir(new Error().stack);

      // proceed to next middleware
      if(!arguments.length) {
        return next();
      // stop middleware execution
      }else if((obj instanceof Error)
        || (obj instanceof ErrorDefinition)
        || typeof obj === 'string') {
        // error raised
        //console.dir(arguments);
        return next.apply(null, arguments);
      }else if(obj === null || typeof obj === 'boolean') {
        return next(obj);
      // execute subcommand
      }else if(obj
        && typeof obj === 'object' && !Array.isArray(obj)) {
        // TODO: allow passing of subcommand object map
        // TODO: and subcommands associated with the command
        //console.log('invoking with object callback arg');
        return invoke.call(scope, obj, req, callback);
      }else if(Array.isArray(obj)) {
        return next(scope.errors.ECMD_ARRAY);
      }
      // unknown response
      next.apply(null, arguments);
    }

    function exec(info, arg, action, req, callback) {
      info.validate = function(cb) {
        var subcommands = this.commands();
        var sub = raw[0], k, names;
        for(k in subcommands) {
          names = subcommands[k].names();
          if(~names.indexOf(sub)) return cb();
        }
        cb(scope.errors.EUNKNOWN_SUBCOMMAND, [sub, cmd]);
      }.bind(arg);
      info.defer = function(cmd, info, req, next) {
        if(!cmd) return next();
        callback(cmd.commands());
      }.bind(this);
      //console.dir(req.command);
      action.call(this, info, req, callback);
    }

    var i, raw = req.unparsed.slice(0), action, cmd, arg, ind, file;
    var delimiter = conf.command.delimiter, parts, info;
    for(i = 0;i < raw.length;i++) {
      cmd = raw[i];
      if(delimiter) {
        if((delimiter instanceof RegExp)
          && delimiter.test(cmd)) {
          parts = cmd.split(delimiter);
          cmd = parts[0];
          parts = parts.slice(1);
        }else if(typeof delimiter === 'string'
          && ~cmd.indexOf(delimiter)) {
          parts = cmd.split(delimiter);
          cmd = parts[0];
          parts = parts.slice(1);
        }
      }
      arg = alias(cmd, this._commands);
      //console.log('testing for command with %s', cmd);
      if(arg) {
        raw.splice(i, 1);
        if(parts) raw = [].concat(parts, raw);
        lazy.call(this, arg);
        action = arg.action();
        if(typeof action == 'function') {
          ind = req.args.indexOf(cmd);
          //req.args.splice(ind, 1);
          info = req.command = {name: cmd, cmd: arg, args: raw};
          if(typeof conf.command.before === 'function') {
            conf.command.before.call(scope, info, req, function() {
              if(arguments.length) return callback.apply(null, arguments);
              exec.call(scope, info, arg, action, req, callback);
            })
          }else{
            exec.call(this, info, arg, action, req, callback);
          }
          return false;
        }
      }
    }
    if(conf && conf.command.required && raw.length && !req.result.empty) {
      return next(scope.errors.EUNKNOWN_COMMAND, [raw[0]]);
    }
    next();
  }
}
