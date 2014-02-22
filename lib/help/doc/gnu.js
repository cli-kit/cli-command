var util = require('util');
var HelpDocument = require('./doc').HelpDocument;

var utils = require('cli-util');
var pad = utils.pad, repeat = utils.repeat, wrap = utils.wrap;
var longest = require('./longest');

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
  this.padding = 1;
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
  // TODO: get string from a format string
  var title = 'Usage: ';
  doc.print.call(this,
    stream, title + '%s ' + parts.join(' '), this.name());
  return true;
}

GnuDocument.prototype.getOptionMetrics = function(doc, keys, target, max) {
  var delimiter = doc.getOptionDelimiter.call(this, doc);
  max = typeof max === 'number' ? max : 0;
  var metrics = {short: false, long: false, both: false, values: {}, width: 0};
  var i, j, key, arg, str, name, z;
  for(i = 0;i < keys.length;i++) {
    key = keys[i]
    arg = target[key];
    str = doc.getOptionString.call(this, arg, doc);
    metrics.width = Math.max(metrics.width, str.length);
    metrics.values[key] = str;
    var names = arg.names();
    for(j = 0;j < names.length;j++) {
      name = names[j];
      if(!metrics.short) metrics.short =
          name.length === 1 || /^-[^-]{1,1}$/.test(name);
      if(!metrics.long) metrics.long = /^--/.test(name);
      if(metrics.short && metrics.long) metrics.both = true;
    }
  }
  // if we have an option that contains a short
  // and long value (both) we search for options that are
  // only a long option and pad them to align with
  // the long option of the options that have both
  if(metrics.both) {
    for(z in metrics.values) {
      arg = target[z];
      //if(arg.names().length === 1 && /^--/.test(arg.names()[0])) {
      if(arg.names().length === 1) {
        metrics.values[z] =
          repeat(delimiter.length + 2) + metrics.values[z];
        metrics.width = Math.max(metrics.width, metrics.values[z].length);
      }
    }
  }
  return metrics;
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
  var arg, parts = [], i, part, desc;
  var width = 0;
  var keys = Object.keys(target);
  var metrics = doc.getOptionMetrics.call(this, doc, keys, target);
  var col = (conf.help && conf.help.column) ? conf.help.column : 80;
  if(conf.help.sort !== false) {
    keys = typeof(conf.help.sort) == 'function'
      ? keys.sort(conf.help.sort) : keys.sort();
  }else{
    if(target === this._options) {
      var both = metrics.both;
      if(both) {
        keys.sort(function(a, b) {
          var aa = target[a];
          var ab = target[b];
          //return aa.names().join('').length < ab.names().join('').length;
          return aa.names().length < ab.names().length;
        })
      }
    }else if(target === this._commands) {
      keys.sort();
    }
  }
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
    parts.push(doc.align.call(this, doc, opts, true));
  }
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    doc.print.call(this,
      stream, part.lead + '%s' + part.space + part.right, part.left);
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
    // TODO: remove these tests
    if(!/:$/.test(title)) title += ':';
    if(/^[a-z]/.test(title)) title = title.charAt(0).toUpperCase()
      + title.slice(1);
    doc.print.call(this, stream);
    doc.print.call(this, stream, title);
  }
}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
GnuDocument.prototype.description = function(data, stream, doc) {
  var conf = this.configure(), desc;
  var col = (conf.help && conf.help.column) ? conf.help.column : 80;
  var enabled = doc.hasSection.call(this, HelpDocument.DESCRIPTION, doc);
  if(enabled && this.description()) {
    desc = wrap(this.description(), 0, col);
    doc.print.call(this, stream, desc);
    doc.print.call(this, stream);
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
  var enabled = doc.hasSection.call(this, HelpDocument.BUGS, doc);
  if(enabled && data.bugs) {
    doc.print.call(this, stream);
    // TODO: get string from a format string
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
