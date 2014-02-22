var util = require('util');
var HelpDocument = require('./doc').HelpDocument;
var GnuDocument = require('./gnu').GnuDocument;

/**
 *  Help style to only write the synopsis (usage).
 */
var SynopsisDocument = function() {
  GnuDocument.apply(this, arguments);
  this.sections = [HelpDocument.SYNOPSIS];
}

util.inherits(SynopsisDocument, GnuDocument);

module.exports = function(program) {
  return new SynopsisDocument(program);
}

module.exports.SynopsisDocument = SynopsisDocument;
