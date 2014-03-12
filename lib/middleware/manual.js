var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var help = require('./help').action;
var alias = require('../util/alias');

function handler(info, req, next) {
  var scope = this;
  var conf = this.configure().manual;
  if(info.args.length) {
    var cmd = info.args[0];
    var command = alias(cmd, this.commands());
    if(!command) {
      return next(this.errors.EUNKNOWN_HELP_CMD, [cmd]);
    }
    process.env.CLI_TOOLKIT_HELP_CMD=cmd;
  }else{
    command = this;
  }
  if(!conf.dir) {
    help.call(this, false, next);
  }else{
    var name = command.getFullName() + '.1';
    var file = path.join(conf.dir, name);
    fs.exists(file, function(exists) {
      if(!exists) return next(scope.errors.EMAN_NOTFOUND, [cmd]);
      var ps = spawn('man', [file], {stdio: 'inherit'});
      ps.once('close', function(code) {
        process.exit(code);
      })
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
}

module.exports.action = handler;
