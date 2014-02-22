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
var PlainDocument = function() {
  HelpDocument.call(this);
  this.remove(
    HelpDocument.NAME,
    HelpDocument.ENVIRONMENT,
    HelpDocument.FILES,
    HelpDocument.EXAMPLES,
    HelpDocument.EXIT,
    HelpDocument.HISTORY,
    HelpDocument.AUTHOR,
    HelpDocument.BUGS,
    HelpDocument.COPYRIGHT,
    HelpDocument.SEE
  );
}

util.inherits(PlainDocument, HelpDocument);

/**
 *  Utility to print to the target stream.
 *
 *  @param stream The target stream.
 *  @param format The message format.
 *  @param ... Message replacement parameters.
 */
PlainDocument.prototype.print = function(stream, format) {
  var conf = this.configure();
  var vanilla = conf.help && conf.help.vanilla;
  var parameters = [].slice.call(arguments, 2);
  var method = (stream === process.stdout || stream === process.stderr)
    ? (stream === process.stdout) ? console.log : console.error : stream.write;
  var scope = (stream === process.stdout || stream === process.stderr)
    ? console : stream;
  var args = [];
  //if(arguments.length === 1 && scope !== console) {
    //format = '';
  //}
  args = parameters;
  args.unshift(format || '');
  if(vanilla || scope === stream) {
    var msg = util.format.apply(util, args);
    if(scope === stream) msg += '\n';
    args = [msg];
  }
  method.apply(scope, args);
}

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
PlainDocument.prototype.synopsis = function(data, stream, doc) {
  var conf = this.configure();
  var vanilla = conf.help && conf.help.vanilla;
  var custom = this.usage();
  var parts = [];
  if(typeof custom == 'string') {
    parts = [custom];
  }else{
    var cmds = Object.keys(this._commands);
    var args = Object.keys(this._options);
    if(cmds.length) parts.push('[command]');
    parts.push('[options]');
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
PlainDocument.prototype.description = function(data, stream, doc) {
  var conf = this.configure();
  var desc = !conf.help || conf.help.description !== false
    || process.env.CLI_TOOLKIT_HELP2MAN;
  if(desc && this.description()) {
    //console.log();
    //console.log(this.description());
    doc.print.call(this, stream);
    doc.print.call(this,
      stream, this.description());
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
PlainDocument.prototype.opts = function(target, data, stream, doc) {
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
      : wrap(arg.description(), 4 + width + 1, col);
    parts.push({
      lead: repeat(), name: pad(arg.name(), width + 1),
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
PlainDocument.prototype.header = function(title, data, stream, doc) {
  if(title) {
    if(!/:$/.test(title)) title += ':';
    if(/^[a-z]/.test(title)) title = title.charAt(0).toUpperCase()
      + title.slice(1);
    console.log();
    console.log(title);
  }
}

module.exports = function() {
  return new PlainDocument();
}

module.exports.PlainDocument = PlainDocument;
module.exports.pad = pad;
module.exports.repeat = repeat;
module.exports.wrap = wrap;
module.exports.longest = longest;
