var fs = require('fs');
var markzero = require('markzero');
var marked = markzero.marked;
var Parser = markzero.Parser;
var ProgramRenderer = require('./renderer');

function parse(markdown, def, callback) {
  // TODO: get lexer configuration
  var lexer = new marked.Lexer({});
  var tokens = lexer.lex(markdown);
  console.dir(tokens);
  var renderer = new ProgramRenderer;
  renderer.cli = this;
  var parser = new Parser({renderer: renderer});
  var md =  parser.parse(tokens);
}

function loader(file, def, callback) {
  var scope = this;
  fs.exists(file, function(exists) {
    if(!exists) return callback(scope.errors.EEXIST, [file]);
    fs.readFile(file, function(err, contents) {
      if(err) return callback(err);
      contents = '' + contents;
      parse.call(scope, contents, def, callback);
    })
  })
}

module.exports = loader;
