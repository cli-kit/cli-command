var util = require('util');
var HelpDocument = require('./doc').HelpDocument;
var utils = require('cli-util'), repeat = utils.repeat;
var fmt = require('./formats');

var h1 = '#';
var h2 = '##';
var space = repeat(1);

/**
 *  Help document that outputs as markdown.
 */
var MarkdownDocument = function() {
  this.colon = false;
  HelpDocument.apply(this, arguments);
  this.format = fmt.MARKDOWN_FORMAT;
  this.vanilla = true;
  this.useCustom = true;
  // disable columns
  this.use = false;
  var format = '* `%s`: %s';
  var overrides = {
    synopsis: '```synopsis\n%s\n```'
  }
  this.markdown = {};
  var conf = this.conf.markdown || {}, i, key;
  var formats = conf.formats || {};
  for(i = 0;i < this.sections.length;i++) {
    key = this.sections[i];
    this.markdown[key] = formats[key] || overrides[key] || format;
  }
}

util.inherits(MarkdownDocument, HelpDocument);

/**
 *  Print the page header.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
MarkdownDocument.prototype.page = function(data, stream) {
  // TODO: allo building complex structures from the env
  //if(process.env.cli_toolkit_help_markdown_title) return;
  var section = typeof(this.conf.section) === 'number'
    ? this.conf.section : 1;
  section = Math.min(Math.max(section, 1), 9);
  // TODO: use longest command name
  var title = this.cmd.getFullName() + ' (' + section + ')'
  title += this.eol + repeat(title.length, '=');
  this.header(title, data, stream, false);
  this.print(stream);
}

/**
 *  @override
 */
//MarkdownDocument.prototype.titles = function() {
  //HelpDocument.prototype.titles.apply(this, arguments);
  //this.headers[HelpDocument.DESCRIPTION] = false;
//}

/**
 *  @override
 */
MarkdownDocument.prototype.header = function(title, data, stream, prefix) {
  prefix = typeof prefix === 'string' ? prefix :
    prefix === false ? false : h2;
  var override = process.env.cli_toolkit_help_markdown_header;
  if(override) prefix = override;
  prefix = (prefix || '');
  if(prefix) title = prefix + space + title;
  HelpDocument.prototype.header.call(this, title, data, stream);
  if(prefix) this.print(stream);
}

/**
 *  @override
 */
MarkdownDocument.prototype.indent = function(value) {return value;}

/**
 *  @override
 */
MarkdownDocument.prototype.printlines = function(parts, stream, key) {
  var i, part;
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    this.print(stream, this.markdown[key], part.left, part.right);
  }
}

/**
 *  @override
 */
MarkdownDocument.prototype.write = function(data, stream) {
  stream = stream || process.stdout;
  data.sections = data.sections || {};
  var synopsis = this.getSynopsis.call(this, true, data.name, null, true);
  //console.log('got synopsis');
  //console.dir(synopsis);
  if(synopsis.length) {
    data.sections[HelpDocument.SYNOPSIS] =
      util.format(this.markdown.synopsis, synopsis);
  }
  this.page(data, stream);
  HelpDocument.prototype.write.call(this, data, stream);
}

module.exports = function(program) {
  return new MarkdownDocument(program);
}

module.exports.MarkdownDocument = MarkdownDocument;
module.exports.h1 = h1;
module.exports.h2 = h2;
