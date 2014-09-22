var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var help = require('./help').action;
var man = require('cli-help').documents.man;

function open(file, exit, next) {
  process.env.CLI_TOOLKIT_HELP_CMD = '';
  process.stdin.pause();
  var ps = spawn('man', [file], {stdio: 'inherit'});
  ps.once('close', function(code) {
    if(exit) process.exit(code);
    process.stdin.resume();
    next();
  })
}

function handler(info, req, next) {
  var scope = this, cmd, command;
  var conf = this.configure().manual
    , exit = this.configure().exit
    , alias = this.finder.getCommandByName
    , sub = null;
  if(info.args.length) {
    cmd = info.args[0];
    command = alias(cmd, this.commands(), {recurse: true});
    if(!command) {
      return next(this.errors.EUNKNOWN_HELP_CMD, [cmd]);
    }

    // handle subcommand references
    sub = command.getParents().length > 1;
    if(sub) {
      command = command.parent();
      cmd = command.key();
    }

    process.env.CLI_TOOLKIT_HELP_CMD = cmd;
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
          delete process.env.CLI_TOOLKIT_HELP_CMD;
          delete process.env.CLI_TOOLKIT_HELP_STYLE;
          stream.end(function() {
            open.call(scope, file, exit, next);
          });
        }, stream, man(scope));
      }else{
        open.call(this, file, exit, next);
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
