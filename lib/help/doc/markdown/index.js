var util = require('util');
var HelpDocument = require('../doc').HelpDocument;

/**
 *  Help document that outputs as markdown.
 */
var MarkdownDocument = function() {
  HelpDocument.apply(this, arguments);
}

util.inherits(MarkdownDocument, HelpDocument);

module.exports = function(program) {
  return new MarkdownDocument(program);
}

module.exports.MarkdownDocument = MarkdownDocument;
