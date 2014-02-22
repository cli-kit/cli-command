var json = require('../json').json;
var sections = [
  'name',
  'synopsis',
  'description',
  'options',
  'environment',
  'files',
  'examples',
  'exit',
  'history',
  'author',
  'bugs',
  'copyright',
  'see'
];

/**
 *  Abstract super class for help documents.
 */
var HelpDocument = function() {
  this.sections = sections.slice(0);
}

/**
 *  Write the name section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.name = function(data, stream, doc) {}

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.synopsis = function(data, stream, doc) {}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.description = function(data, stream, doc) {}

/**
 *  Write the options section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.options = function(data, stream, doc) {
  doc.commands.call(this, data, stream, doc);
  doc.arguments.call(this, data, stream, doc);
}

/**
 *  Write the environment section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.environment = function(data, stream, doc) {}

/**
 *  Write the files section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.files = function(data, stream, doc) {}

/**
 *  Write the examples section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.examples = function(data, stream, doc) {}

/**
 *  Write the exit status section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.exit = function(data, stream, doc) {}

/**
 *  Write the history section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.history = function(data, stream, doc) {}

/**
 *  Write the author section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.author = function(data, stream, doc) {}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.bugs = function(data, stream, doc) {}

/**
 *  Write the copyright section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.copyright = function(data, stream, doc) {}

/**
 *  Write the see also section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.see = function(data, stream, doc) {}

/**
 *  Utility to remove a section by key from
 *  the list of sections that will be rendered.
 *
 *  @param ... List of keys to remove.
 */
HelpDocument.prototype.remove = function() {
  //console.log('removing %j', arguments);
  //console.dir(arguments);
  var ind, i, key;
  for(i = 0;i < arguments.length;i++) {
    key = arguments[i];
    //console.dir(key);
    ind = this.sections.indexOf(key);
    if(~ind) {
      this.sections.splice(ind, 1);
    }
  }
}

/**
 *  Write command options.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.commands = function(data, stream, doc) {
  var opts = Object.keys(this._commands);
  if(!opts.length) return;
  doc._commands.call(this, data, stream, doc);
}

/**
 *  Write command options if any commands are defined.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype._commands = function(data, stream, doc) {}

/**
 *  Write argument options.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.arguments = function(data, stream, doc) {
  var opts = Object.keys(this._options);
  if(!opts.length) return;
  doc._arguments.call(this, data, stream, doc);
}

/**
 *  Write argument options if any arguments are defined.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype._arguments = function(data, stream, doc) {}

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
  for(i = 0;i < this.sections.length;i++) {
    method = this[this.sections[i]];
    result = method.call(program, data, stream, this);
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
sections.forEach(function(key) {
  module.exports[key.toUpperCase()] = HelpDocument[key.toUpperCase()] = key;
});
