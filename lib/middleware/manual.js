var help = require('./help').action;
var alias = require('../util/alias');

function handler(info, req, next) {
  if(!info.args.length) {
    return help.call(this, false, next);
  }
  var cmd = info.args[0];
  var command = alias(cmd, this.commands());
  if(!command) {
    return next(this.errors.EUNKNOWN_HELP_CMD, [cmd]);
  }
  process.env.CLI_TOOLKIT_HELP_CMD=cmd;
  help.call(this, false, next);
}

/**
 *  Adds a help command to the program.
 *
 *  @param name The command name.
 *  @param description The command description.
 *  @param conf A middleware configuration.
 */
module.exports = function(name, description, conf) {
  if(name && typeof name === 'object') {
    conf = name;
    name = null;
  }
  conf = conf || this.configure().manual;
  if(!conf) return this;
  name = name || 'help';
  description = description || 'Show help for commands';
  this.command(name)
    .description(description)
    .action(handler);
}

module.exports.action = handler;
