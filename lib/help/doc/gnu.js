var util = require('util');
var HelpDocument = require('./doc').HelpDocument;

var utils = require('cli-util');
var pad = utils.pad, repeat = utils.repeat, wrap = utils.wrap;

function longest(target, max) {
  var mx = max || 0, z;
  for(z in target) {
    mx = Math.max(mx, target[z].name().length);
  }
  return mx;
}

/**
 *  Write help as a plain text document as if it were
 *  being sent to a tty.
 */
var GnuDocument = function() {
  HelpDocument.call(this);
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
}

util.inherits(GnuDocument, HelpDocument);

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.synopsis = function(data, stream, doc) {
  var conf = this.configure();
  var vanilla = conf.help && conf.help.vanilla;
  var custom = this.usage();
  var parts = [];
  if(typeof custom == 'string') {
    parts = [custom];
  }else{
    var cmds = Object.keys(this._commands);
    var args = Object.keys(this._options);
    if(cmds.length) parts.push('[COMMAND]');
    parts.push('[OPTION]');
  }
  var title = 'Usage: ';
  doc.print.call(this,
    stream, title + '%s ' + parts.join(' '), this.name());
  return true;
}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.description = function(data, stream, doc) {
  var conf = this.configure();
  var col = (conf.help && conf.help.column) ? conf.help.column : 80;
  var desc = !conf.help || conf.help.description !== false
    || process.env.CLI_TOOLKIT_HELP2MAN;
  if(desc && this.description()) {
    desc = wrap(this.description(), 0, col);
    doc.print.call(this, stream, desc);
    doc.print.call(this, stream);
  }
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
  var conf = this.configure();
  var arg, parts = [], width, i, part, desc;
  width = longest.call(this, this._options);
  width = longest.call(this, this._commands, width);
  var keys = Object.keys(target);
  var col = (conf.help && conf.help.column) ? conf.help.column : 80;
  if(conf.help.sort !== false) {
    keys = typeof(conf.help.sort) == 'function'
      ? keys.sort(conf.help.sort) : keys.sort();
  }
  for(i = 0;i < keys.length;i++) {
    arg = target[keys[i]];
    desc = process.env.CLI_TOOLKIT_HELP2MAN
      ? arg.description()
      : wrap(arg.description(), 3 + width + 1, col);
    parts.push({
      lead: repeat(1), name: pad(arg.name(), width + 1),
      pad: repeat(), desc: desc
    });
  }
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    doc.print.call(this,
      stream, part.lead + '%s' + part.pad + part.desc, part.name);
  }
  return true;
}

/**
 *  Write a section header.
 *
 *  @param title The value for the section header.
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.header = function(title, data, stream, doc) {
  if(title) {
    if(!/:$/.test(title)) title += ':';
    if(/^[a-z]/.test(title)) title = title.charAt(0).toUpperCase()
      + title.slice(1);
    doc.print.call(this, stream);
    doc.print.call(this, stream, title);
  }
}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.bugs = function(data, stream, doc) {
  if(data.bugs) {
    doc.print.call(this, stream);
    var str = 'Reports bugs to ' + (data.bugs.email || data.bugs.url) + '.';
    return str;
  }
}

module.exports = function() {
  return new GnuDocument();
}

module.exports.GnuDocument = GnuDocument;
module.exports.pad = pad;
module.exports.repeat = repeat;
module.exports.wrap = wrap;
module.exports.longest = longest;
