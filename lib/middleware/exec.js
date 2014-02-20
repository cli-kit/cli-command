var fs = require('fs');
var path = require('path'),
  dirname = path.dirname,
  basename = path.basename;
var spawn = require('child_process').spawn;

var alias = require('../util/alias');
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
function execute(argv, cmd, args, req) {
  var config = this.configure();
  var errors = this.errors, scope = this, e;
  var dir = config.bin || dirname(argv[1]);
  var bin = this._name + '-' + cmd;
  var local = path.join(dir, bin);
  var exists = fs.existsSync(local);
  var data = {bin: bin, dir: dir, local: local, args: args};
  if(!exists) {
    e = new ExecError(errors.ENOENT.message, [bin], errors.ENOENT.code);
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

/**
 *  Searches the raw arguments looking for the first argument
 *  that matches a known command and executes the command if it
 *  is in the list of exec commands.
 */
module.exports = function(){
  return function exec(req, next) {
    if(!arguments.length) return;
    var i, raw = req.result.raw.slice(0), cmd, arg, ps;
    for(i = 0;i < raw.length;i++) {
      cmd = raw[i]; arg = alias(cmd, this._commands);
      if(arg) {
        raw.splice(i, 1);
        if(this._exec[arg.key()]) {
          try {
            ps = execute.call(this, process.argv, cmd, raw, req);
          }catch(e) {
            return next(e);
          }
          req.process = ps;
          // NOTE: we must not call next() here, middleware processing halts
          return;
        }
      }
    }
    next();
  }
}

module.exports.error = error;
