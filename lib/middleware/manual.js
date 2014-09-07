var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var help = require('./help').action;
var alias = require('../util/alias');
var man = require('../help/doc/man');

function open(file, exit) {
  if(exit) {
    process.stdin.pause();
  }
  var ps = spawn('man', [file], {stdio: 'inherit'});
  ps.once('close', function(code) {
    if(exit) process.exit(code);
  })
}

function handler(info, req, next) {
  var scope = this, cmd, command;
  var conf = this.configure().manual,
    exit = this.configure().exit;
  if(info.args.length) {
    cmd = info.args[0];
    command = alias(cmd, this.commands());
    if(!command) {
      return next(this.errors.EUNKNOWN_HELP_CMD, [cmd]);
    }
    process.env.CLI_TOOLKIT_HELP_CMD=cmd;
  }else{
    command = this;
  }
  if(!conf.dir || process.env.CLI_TOOLKIT_MAN_PUBLISH) {
    help.call(this, false, next);
  }else{
    var name = command.getFullName() + '.1';
    var file = path.join(conf.dir, name);
    fs.exists(file, function(exists) {
      if(!exists && !conf.dynamic) {
        return next(scope.errors.EMAN_NOTFOUND, [cmd]);
      }else if(conf.dynamic) {
        var stream = fs.createWriteStream(file, {flags: 'w'});
        process.env.CLI_TOOLKIT_HELP_STYLE='man';
        process.env.CLI_TOOLKIT_HELP_CMD=cmd;
        help.call(scope, true, function() {
          stream.end(function() {
            open.call(scope, file, exit);
          });
        }, stream, man(scope));
      }else{
        open.call(this, file, exit);
      }
    });
  }
}

/**
 *  Adds a help command to the program.
 *
 *  @param name The command name.
 *  @param description The command description.
 */
module.exports = function(name, description) {
  var conf = this.configure().manual;
  if(!conf) return this;
  name = name || 'help';
  description = description || 'Show help for commands';
  this.command(name)
    .description(description)
    .usage(name + ' <command>')
    .action(handler);
  return this;
}

module.exports.action = handler;
