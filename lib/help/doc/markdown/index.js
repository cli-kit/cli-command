var util = require('util');
var HelpDocument = require('../doc').HelpDocument;
var utils = require('cli-util'), repeat = utils.repeat;

var h1 = '#';
var h2 = '##';
var space = repeat(1);

/**
 *  Help document that outputs as markdown.
 */
var MarkdownDocument = function() {
  this.colon = false;
  HelpDocument.apply(this, arguments);
}

util.inherits(MarkdownDocument, HelpDocument);

/**
 *  Print the page header.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
MarkdownDocument.prototype.page = function(data, stream) {
  var section = typeof(this.conf.section) === 'number'
    ? this.conf.section : 1;
  section = Math.min(Math.max(section, 1), 9);
  var title = this.cli.name() + ' (' + section + ')';
  title += this.eol + repeat(title.length, '=');
  this.header(title, data, stream, false);
  this.print(stream);
}

/**
 *  Initialize section titles, creating defaults and overriding
 *  with titles specified in the help configuration.
 */
MarkdownDocument.prototype.titles = function() {
  HelpDocument.prototype.titles.apply(this, arguments);
  this.headers[HelpDocument.DESCRIPTION] = false;
}

/**
 *  Write a section header.
 *
 *  @param title The value for the section header.
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param prefix A header prefix string.
 */
MarkdownDocument.prototype.header = function(title, data, stream, prefix) {
  prefix = typeof prefix === 'string' ? prefix :
    prefix === false ? false : h2;
  prefix = (prefix || '');
  if(prefix) title = prefix + space + title;
  HelpDocument.prototype.header.call(this, title, data, stream);
}

/**
 *  Indent lines by amount.
 *
 *  @param value The .
 *  @param data The program data.
 *  @param stream The output stream.
 */
MarkdownDocument.prototype.indent = function(value, amount, data, stream) {
  return value;
}

/**
 *  Print a section defined as an array.
 */
MarkdownDocument.prototype.printsection = function(section, stream) {
  var i, left, right;
  var parts = [];
  for(i = 0;i < section.length;i++) {
    left = section[i].name || '';
    right = this.getDescription(section[i].description || '');
    if(!left) continue;
    parts.push({left: left, right: right});
  }
  this.printlines(parts, stream);
}

MarkdownDocument.prototype.printlines = function(parts, stream) {
  var i, part;
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    //this.print(stream, part.lead + '%s' + part.right, part.left);
  }
}

/**
 *  Write the document to a stream.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
MarkdownDocument.prototype.write = function(data, stream) {
  stream = stream || process.stdout;
  data.sections = data.sections || {};
  var synopsis = this.getSynopsis();
  //synopsis[0] = this.eol + synopsis[0];
  synopsis.push(this.cli.name());
  data.sections[HelpDocument.SYNOPSIS] =
    util.format.apply(util, synopsis);
  this.page(data, stream);
  HelpDocument.prototype.write.call(this, data, stream);
}

module.exports = function(program) {
  return new MarkdownDocument(program);
}

module.exports.MarkdownDocument = MarkdownDocument;
