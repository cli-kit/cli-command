var util = require('util');
var HelpDocument = require('./doc').HelpDocument;

var define = require('cli-define');
var utils = require('cli-util');
var wrap = utils.wrap, repeat = utils.repeat;
var columns = require('./column');

/**
 *  Short style command help output similar to npm(1).
 */
var CmdDocument = function() {
  HelpDocument.apply(this, arguments);
  var conf = this.cli.configure();
  conf.synopsis = conf.synopsis || {};
  conf.synopsis.options = false;
  conf.synopsis.usage = null;
  this.useCustom = false;
  this.sections = [
    HelpDocument.SYNOPSIS,
    HelpDocument.COMMANDS
  ];
}

util.inherits(CmdDocument, HelpDocument);

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
CmdDocument.prototype.synopsis = function(data, stream) {
  this.print(stream);
  var usage = this.getSynopsis.call(
    this, true, data.name, this.headers[HelpDocument.SYNOPSIS] + ' ');
  if(usage.length) {
    this.print(stream, usage);
    return true;
  }
  return false;
}

/**
 *  Write the options section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
CmdDocument.prototype.options = function(data, stream) {
  return false;
}

/**
 *  Write command options.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
CmdDocument.prototype.commands = function(data, stream) {
  if(this.hasCommands() && this.summarize()) {
    //this.print(data, stream);
    var primary = [], keys = Object.keys(this.cmd._commands);
    keys = keys.sort();
    for(var z in keys) {
      z = keys[z];
      primary = primary.concat(this.cmd._commands[z].names());
    }

    var msg = this.messages.cmd, list, indent = repeat(4);
    list = primary.join(', ');
    if(this.wraps) {
      msg = wrap(msg, 0, this.limit);
      list = wrap(list, 0, Math.max(this.limit - indent.length - 16, 24));

      list = list.split('\n');
      list = list.map(function(line) {
        return indent + line;
      })
      list = list.join('\n');
    }
    var args = [stream, msg + list];
    this.print.apply(this, args);
  }
  return false;
}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
CmdDocument.prototype.bugs = function(data, stream) {
  this.print(stream, this.getDefaultBugs(data));
  // NOTE: halt further section processing
  return null;
}

module.exports = function(program) {
  return new CmdDocument(program);
}

module.exports.CmdDocument = CmdDocument;
