var json = require('../json').json;
var sections = [];

/**
 *  Abstract super class for help documents.
 */
var HelpDocument = function() {}

/**
 *  Write the name section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.name = function(data, stream) {}

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.synopsis = function(data, stream) {}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.description = function(data, stream) {}

/**
 *  Write the options section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.options = function(data, stream) {}

/**
 *  Write the environment section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.environment = function(data, stream) {}

/**
 *  Write the files section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.files = function(data, stream) {}

/**
 *  Write the examples section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.examples = function(data, stream) {}

/**
 *  Write the exit status section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.exit = function(data, stream) {}

/**
 *  Write the history section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.history = function(data, stream) {}

/**
 *  Write the author section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.author = function(data, stream) {}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.bugs = function(data, stream) {}

/**
 *  Write the copyright section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.copyright = function(data, stream) {}

/**
 *  Write the see also section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.see = function(data, stream) {}

for(var z in HelpDocument.prototype) {
  sections.push(z);
}

/**
 *  Write the document to a stream.
 *
 *  @param program The program.
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.write = function(program, data, stream) {
  stream = stream || process.stdout;
  if(!data) data = json.call(program);
  var i, method, result;
  for(i = 0;i < sections.length;i++) {
    method = this[sections[i]];
    result = method.call(program, data, stream);
    // was written to the stream
    if(result === true) continue;
    if(typeof result === 'string') {
      stream.write(result);
    }
  }
}

module.exports = {};
module.exports.HelpDocument = HelpDocument;
module.exports.sections = sections;
