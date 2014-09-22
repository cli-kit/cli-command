var fs = require('fs');
var path = require('path'),
  dirname = path.dirname,
  basename = path.basename;
var spawn = require('child_process').spawn;

var ExecError = require('../error/exec');

/**
 *  Child process error handler.
 *
 *  @param scope The program scope.
 *  @param err The Error instance.
 *  @param parameters Message replacement parameters.
 */
function error(scope, err, parameters) {
  if(err.code == 'EACCES') {
    scope.raise(scope.errors.EPERM, parameters);
  }
}

/**
 *  Execute a command as an external program.
 *
 *  @param argv The program arguments.
 *  @param cmd The command to execute.
 *  @param args Array of arguments to pass to the command.
 *  @param req The request object for the middleware execution.
 */
function execute(argv, bin, args, req) {
  var config = this.configure();
  var errors = this.errors, scope = this, e;
  var dir = config.bin || dirname(argv[1]);
  var local = path.join(dir, bin);
  var exists = fs.existsSync(local);
  var data = {bin: bin, dir: dir, local: local, args: args};
  if(!exists) {
    e = new ExecError(errors.EEXEC_NOENT.message, [bin], errors.EEXEC_NOENT.code);
    e.data = data;
    throw e;
  }
  var stat = fs.statSync(local);
  var ps = spawn(local, args, {stdio: [0, 1, 'pipe']});
  req.process = ps;
  this.emit('exec', ps, local, args, req);
  ps.on('error', function(err){
    error(scope, err, [bin]);
  });
  // suppress the execvp() error so we can cleanly
  // present our own error message
  ps.stderr.on('data', function(data) {
    if(!/^execvp\(\)/.test(data.toString())) {
      process.stderr.write(data);
    }
  })
  ps.on('close', function (code, signal) {
    // NOTE: workaround for https://github.com/joyent/node/issues/3222
    // NOTE: assume child process exited gracefully on SIGINT
    if(signal == 'SIGINT') {
      return process.exit(0);
    }
    // TODO: remove this event?
    scope.emit('close', code, signal);
    if(config.exit) process.exit(code);
  });
  return ps;
}

function getArgumentIndexByAlias(cmd, raw) {
  var i, ind;
  for(i = 0;i < raw.length;i++) {
    ind = cmd.names().indexOf(raw[i])
    if(~ind) {
      return i;
    }
  }
  return -1;
}

function getBinaryName(cmd, key) {
  var delimiter = '-';
  //console.log('executable name is : %s', this._name);
  var name = this._name + delimiter;
  if(cmd.parent() === this) {
    name += key;
  }else{
    // build name from all parent commands
    var p = cmd.parent();
    var list = [];
    while(p !== this) {
      list.push(p.key());
      p = p.parent();
    }
    list.reverse();
    list.push(key);
    name += list.join(delimiter);
  }
  return name;
}

function findExecutableCommand(command, req, next) {
  var raw = req.result.raw.slice(0), cmd, ps;
  var exec = command._exec;
  var z, map = command.commands(), ind, res, bin;
  for(z in map) {
    cmd = map[z];
    ind = getArgumentIndexByAlias(cmd, raw);
    if(exec[z] && ~ind) {
      bin = getBinaryName.call(this, cmd, z);
      //console.log('name is %s', bin);
      raw.splice(ind, 1);
      try {
        ps = execute.call(this, process.argv, bin, raw, req);
      }catch(e) {
        return e;
      }
      req.process = ps;
      return true;
    }
    // recurse into child commands
    if(Object.keys(cmd.commands()).length) {
      res = findExecutableCommand.call(this, cmd, req, next);
      if(res) return res;
    }
  }
  return;
}

/**
 *  Searches the raw arguments looking for the first argument
 *  that matches a known command and executes the command if it
 *  is in the list of exec commands.
 */
module.exports = function(){
  var conf = this.configure();
  if(!conf.command.exec) return this;
  return function exec(req, next) {
    var result = findExecutableCommand.call(this, this, req, next);
    if(result === undefined) {
      return next();
    }
    next(result);
  }
}

module.exports.error = error;
