var fs = require('fs');
var path = require('path'),
  dirname = path.dirname,
  basename = path.basename;
var spawn = require('child_process').spawn;

/**
 *  Check file permissions.
 *
 *  canExecute():
 *  checkPermission (stat, 1);
 *
 *  canRead():
 *  checkPermission (stat, 4);
 *
 *  canWrite():
 *  checkPermission (stat, 2);
 */
// TODO: move to cli-util module
function permissions(stat, mask) {
  return !!(mask &
    parseInt((stat.mode & parseInt("777", 8)).toString (8)[0]));
}

/**
 *  Execute a command as an external program.
 *
 *  @param argv The program arguments.
 *  @param cmd The command to execute.
 *  @param args Array of arguments to pass to the command.
 */
function execute(argv, cmd, args) {
  var config = this.configuration();
  var scope = this;
  var dir = config.bin || dirname(argv[1]);
  var bin = this._name + '-' + cmd;
  var local = path.join(dir, bin);
  var exists = fs.existsSync(local);
  var data = {bin: bin, dir: dir, local: local, args: args};
  if(!exists) {
    return raise.call(this, errors.ENOENT, [bin], data);
  }
  var stat = fs.statSync(local);
  //var perms = stat.mode & 0777;
  //console.log('%s', perms);
  //console.log('%s', check(stat, 1));
  if(!permissions(stat, 1)) {
    return raise.call(this, errors.EPERM, [bin], data);
  }
  var ps = spawn(local, args, {stdio: 'inherit'});
  //ps.on('error', function(err){
    // NOTE: keep these tests just in case the above logic is wrong
    // NOTE: or quite likely fails on windows
    //if(err.code == 'ENOENT') {
      //raise.call(scope, codes.ENOENT, null, [bin, dir, local, args]);
    //}else if (err.code == 'EACCES') {
      //raise.call(scope, codes.EPERM, null, [bin, dir, local, args]);
    //}
  //});
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
 *  that matches a known command and either executes the command
 *  as an external program or invokes an action associated
 *  with the command.
 */
module.exports = function(){
  return function command(req, next) {
    var commands = this._commands;
    function find(cmd) {
      var z, arg;
      for(z in commands) {
        arg = commands[z];
        if(~arg.names().indexOf(cmd)) {
          return arg;
        }
      }
    }
    var z, i, raw = req.result.raw.slice(0), action, cmd, arg, ind;
    for(i = 0;i < raw.length;i++) {
      cmd = raw[i]; arg = find(cmd);
      if(arg) {
        raw.splice(i, 1);
        action = arg.action();
        if(!action) {
          return execute.call(this, process.argv, cmd, raw);
        }else if(action) {
          ind = req.args.indexOf(cmd);
          if(~ind) req.args.splice(ind, 1);
          return action.call(this, arg, req.result.all, raw);
        }
      }
    }
    next();
  }
}
