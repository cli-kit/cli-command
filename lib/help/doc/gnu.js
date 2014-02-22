var util = require('util');
var HelpDocument = require('./doc').HelpDocument;

var utils = require('cli-util');
var pad = utils.pad, repeat = utils.repeat, wrap = utils.wrap;

/**
 *  Write help as a plain text document as if it were
 *  being sent to a tty.
 */
var GnuDocument = function() {
  HelpDocument.apply(this, arguments);
  this.remove(
    HelpDocument.NAME,
    HelpDocument.ENVIRONMENT,
    HelpDocument.FILES,
    HelpDocument.EXIT,
    HelpDocument.HISTORY,
    HelpDocument.AUTHOR,
    HelpDocument.COPYRIGHT,
    HelpDocument.SEE
  );
  this.padding = 1;
}

util.inherits(GnuDocument, HelpDocument);

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.synopsis = function(data, stream) {
  var conf = this.cli.configure();
  var vanilla = conf.help.vanilla;
  var custom = this.cli.usage();
  var parts = [];
  if(typeof custom == 'string') {
    parts = [custom];
  }else{
    var cmds = Object.keys(this.cli._commands);
    var args = Object.keys(this.cli._options);
    if(cmds.length) parts.push(conf.help.messages.usage.command);
    parts.push(conf.help.messages.usage.option);
  }
  this.print(stream, this.headers[HelpDocument.SYNOPSIS] + ' '
      + '%s ' + parts.join(' '), this.cli.name());
  return true;
}

/**
 *  Write a group of options.
 *
 *  @param target The object containing option definitions.
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.opts = function(target, data, stream, doc) {
  var arg, parts = [], i, desc;
  var width = 0;
  var keys = Object.keys(target);
  var metrics = this.getOptionMetrics(keys, target);
  var col = (this.conf.column) ? this.conf.column : 80;
  this.sort(keys, target, metrics);
  opts = {
    left: null,
    right: null,
    indent: null,
    width: width,
    wrap: !process.env.CLI_TOOLKIT_HELP2MAN
  }
  for(i = 0;i < keys.length;i++) {
    arg = target[keys[i]];
    opts.left = metrics.values[keys[i]];
    opts.right = arg.description();
    parts.push(this.align(opts, true));
  }

  this.printlines(parts, stream);
  return true;
}

/**
 *  Write a section header.
 *
 *  @param title The value for the section header.
 *  @param data The program data.
 *  @param stream The output stream.
 */
GnuDocument.prototype.header = function(title, data, stream) {
  if(title) {
    this.print(stream);
    this.print(stream, title);
  }
}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.description = function(data, stream) {
  var conf = this.cli.configure(), desc;
  var col = (conf.help && conf.help.column) ? conf.help.column : 80;
  var enabled = this.hasSection(HelpDocument.DESCRIPTION);
  if(enabled && this.cli.description()) {
    desc = wrap(this.cli.description(), 0, col);
    this.print(stream, desc);
    this.print(stream);
  }
}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.bugs = function(data, stream) {
  var enabled = this.hasSection(HelpDocument.BUGS);
  if(enabled && data.bugs) {
    var conf = this.cli.configure();
    this.print(stream);
    this.print(stream, conf.help.messages.bugs,
      (data.bugs.email || data.bugs.url));
    return true;
  }
}

module.exports = function(program) {
  return new GnuDocument(program);
}

module.exports.GnuDocument = GnuDocument;
module.exports.pad = pad;
module.exports.repeat = repeat;
module.exports.wrap = wrap;
