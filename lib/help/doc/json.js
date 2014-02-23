var util = require('util');
var HelpDocument = require('./doc').HelpDocument;
var stringify = require('../json').stringify;

/**
 *  Write help as a JSON document.
 */
var JsonDocument = function() {
  HelpDocument.apply(this, arguments);
}

util.inherits(JsonDocument, HelpDocument);

/**
 *  Write the document to a stream.
 *
 *  @param program The program.
 *  @param data The program data.
 *  @param stream The output stream.
 */
JsonDocument.prototype.write = function(data, stream) {
  stream = stream || process.stdout;
  var str = stringify.call(this.cli);
  stream.write(str);
  return true;
}

module.exports = function(program) {
  return new JsonDocument(program);
}
module.exports.JsonDocument = JsonDocument;
