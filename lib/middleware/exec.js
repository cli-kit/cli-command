var fs = require('fs');
var path = require('path'),
  dirname = path.dirname,
  basename = path.basename;
var spawn = require('child_process').spawn;

var bitmask = require('cli-fs').bitmask;

var alias = require('../util/alias');
var ExecError = require('../error/exec');

/**
 *  Execute a command as an external program.
 *
 *  @param argv The program arguments.
 *  @param cmd The command to execute.
 *  @param args Array of arguments to pass to the command.
 *  @param req The request object for the middleware execution.
 */
function execute(argv, cmd, args, req) {
  var config = this.configuration();
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
  // FIXME: this logic is flawed
  var mode = (process.getuid() === 0) ? '777' : '077';
  if(!bitmask(stat, 1, mode)) {
    e = new ExecError(errors.EPERM.message, [bin], errors.EPERM.code);
    e.data = data;
    throw e;
  }
  var ps = spawn(local, args, {stdio: 'inherit'});
  req.process = ps;
  this.emit('exec', ps, local, args, req);
  ps.on('error', function(err){
    //NOTE: keep these tests just in case the above logic is wrong
    //NOTE: or quite likely fails on windows
    //if(err.code == 'ENOENT') {
      //raise.call(scope, codes.ENOENT, null, [bin, dir, local, args]);
    //}else if (err.code == 'EACCES') {
      //raise.call(scope, codes.EPERM, null, [bin, dir, local, args]);
    //}
    //scope.emit('error', e);
    scope.raise(e);
  });
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
