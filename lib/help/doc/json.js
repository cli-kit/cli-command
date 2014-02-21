var stringify = require('../json').stringify;

/**
 *  Write help as a JSON document.
 */
var JsonDocument = function() {}

/**
 *  Write the document to a stream.
 *
 *  @param program The program.
 *  @param data The program data.
 *  @param stream The output stream.
 */
JsonDocument.prototype.write = function(program, data, stream) {
  stream = stream || process.stdout;
  var str = stringify.call(program);
  stream.write(str);
  return true;
}

module.exports = function() {
  return new JsonDocument();
  //return doc.write(this);
}
module.exports.JsonDocument = JsonDocument;
