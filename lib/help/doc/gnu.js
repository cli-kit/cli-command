var util = require('util');
var HelpDocument = require('./doc').HelpDocument;

var utils = require('cli-util');
var wrap = utils.wrap, repeat = utils.repeat;

/**
 *  Write help as a plain text document as if it were
 *  being sent to a tty.
 */
var GnuDocument = function() {
  HelpDocument.apply(this, arguments);
  this.remove(HelpDocument.COPYRIGHT);
}

util.inherits(GnuDocument, HelpDocument);

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.synopsis = function(data, stream) {
  var parts = this.getSynopsis();
  this.print(stream,
      this.headers[HelpDocument.SYNOPSIS]
      + ' ' + parts.join(), this.cli.name());
  return true;
}

/**
 *  Write the options section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.options = function(data, stream) {
  if(this.hasCommands() && this.summarize()) {
    this.title(HelpDocument.ARGUMENTS, data, stream);
    return this.opts(
      this.cli._options, HelpDocument.OPTIONS, data, stream);
  }
  return HelpDocument.prototype.options.apply(this, arguments);
}

/**
 *  Write command options.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.commands = function(data, stream) {
  if(this.hasCommands() && this.summarize()) {
    this.title(HelpDocument.OPTIONS, data, stream);
    var primary = [];
    for(var z in this.cli._commands) {
      primary.push(this.cli._commands[z].names()[0]);
    }
    // NOTE: adding left padding here breaks
    // NOTE: help2man so we use a newline to delimit
    // NOTE: the command summary message
    if(!this.collapse) this.print(stream);
    var msg = this.messages.summary, list;
    list = primary.join(', ');
    if(/%s/.test(msg)) msg = util.format(msg, list);
    if(this.wraps) {
      msg = wrap(msg, 0, this.limit);
    }
    var args = [stream, this.getDescription(msg)];
    this.print.apply(this, args);
    if(!this.collapse) this.print(stream);
  }
  return this._commands(data, stream);
}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.description = function(data, stream) {
  var desc;
  var enabled = this.hasSection(HelpDocument.DESCRIPTION);
  if(enabled && this.cli.description()) {
    desc = wrap(this.getDescription(this.cli.description()), 0, this.limit);
    this.print(stream, desc);
  }
  return true;
}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.bugs = function(data, stream) {
  this.print(stream, this.getDefaultBugs(data));
  // NOTE: halt further section processing
  return null;
}

module.exports = function(program) {
  return new GnuDocument(program);
}

module.exports.GnuDocument = GnuDocument;
