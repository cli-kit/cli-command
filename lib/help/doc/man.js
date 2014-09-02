var util = require('util');
var moment = require('moment');
var MarkdownDocument = require('./markdown').MarkdownDocument;
var fmt = require('./formats');
var markzero = require('markzero');
var manual = markzero.manual;
var Parser = markzero.Parser;
var ManualRenderer = markzero.ManualRenderer;
var headers = require('./doc').headers;

/**
 *  A stream that buffers the contents of the document
 *  so that it may be converted from markdown to a man
 *  page once the document has been constructed.
 *
 *  Attempting to stream the conversion could result in
 *  some very strange behaviour.
 */
function ManDocumentStream() {
  this.content = '';
}

ManDocumentStream.prototype.write = function(data) {
  this.content += data;
}

/**
 *  Help document that outputs a man page.
 *
 *  Thie implementation extends the markdown format
 *  and used the markzero renderer to perform the conversion
 *  after buffering the markdown representation of the document.
 */
var ManDocument = function() {
  MarkdownDocument.apply(this, arguments);
  this.format = fmt.MAN_FORMAT;
}

util.inherits(ManDocument, MarkdownDocument);

/**
 *  Print the page header.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
ManDocument.prototype.page = function(data, stream) {
  //this.header(manual.header(manual.DESCRIPTION), data, stream, true);
  this.print(stream);
}

/**
 *  @override
 */
ManDocument.prototype.getHeaderMap = function() {
  return {see: headers.see};
}

/**
 *  @override
 */
ManDocument.prototype.titles = function() {
  //this.headers[MarkdownDocument.DESCRIPTION] = true;
  //MarkdownDocument.prototype.titles.apply(this, arguments);
}

/**
 *  @override
 */
ManDocument.prototype.write = function(data, stream) {
  //console.dir(this.sections);
  stream = stream || process.stdout;
  var buffer = new ManDocumentStream;
  MarkdownDocument.prototype.write.call(this, data, buffer);
  var lexer = new markzero.Lexer();
  var tokens = lexer.lex(buffer.content);
  //console.log('writing with buffer content %s', buffer.content);
  //console.dir(tokens);
  var renderer = new ManualRenderer;
  var parser = new Parser({renderer: renderer, mangle: false});
  //console.log('MAN DOCUMENT PARSING %s', data);
  var dt = moment().format('MMMM YYYY');
  var name = this.cmd.getFullName();
  if(this.cmd.description() && this.cmd.detail()) {
    name += ' -- ' + this.cmd.description();
  }
  var parents = this.cmd.getParents();
  var root = !parents.length ? this.cmd : parents.pop();
  var version = root.package().version;
  var page = manual.preamble({name: name, date: dt, version: version});
  page += parser.parse(tokens);
  stream.write(page);
}

module.exports = function(program) {
  return new ManDocument(program);
}

module.exports.ManDocument = ManDocument;
