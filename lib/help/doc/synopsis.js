var util = require('util');
var HelpDocument = require('./doc').HelpDocument;
var GnuDocument = require('./gnu').GnuDocument;

/**
 *  Help style to only write the synopsis (usage).
 */
var SynopsisDocument = function() {
  GnuDocument.call(this);
  this.sections = [HelpDocument.SYNOPSIS];
}

util.inherits(SynopsisDocument, GnuDocument);

module.exports = function() {
  return new SynopsisDocument();
}

module.exports.SynopsisDocument = SynopsisDocument;
