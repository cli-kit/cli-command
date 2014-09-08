var util = require('util');
var HelpDocument = require('./doc').HelpDocument;

var define = require('cli-define');
var utils = require('cli-util');
var wrap = utils.wrap, repeat = utils.repeat;
var columns = require('./column');

/**
 *  Write help as a plain text document as if it were
 *  being sent to a tty.
 */
var GnuDocument = function() {
  HelpDocument.apply(this, arguments);
  //console.dir(this.sections);
  this.useCustom = false;
  this.remove(HelpDocument.COPYRIGHT);
  this.remove(HelpDocument.ENVIRONMENT);
  this.remove(HelpDocument.FILES);
  this.remove(HelpDocument.HISTORY);
  this.remove(HelpDocument.SEE);
}

util.inherits(GnuDocument, HelpDocument);

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.synopsis = function(data, stream) {
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
GnuDocument.prototype.options = function(data, stream) {
  if(this.hasCommands() && this.summarize() && this.hasOptions()) {
    this.title(HelpDocument.OPTIONS, data, stream);
    return this.opts(
      this.cmd._options, HelpDocument.OPTIONS, data, stream);
  }
  return HelpDocument.prototype.options.apply(this, arguments);
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
  //console.log('writing description...');
  if(enabled && this.cmd.description()) {
    desc = define.toDescription(this.cmd.description()).txt;
    desc = wrap(
      this.getDescription(desc), 0, this.limit);
    this.print(stream, desc);
    return true;
  }
  return false;
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
