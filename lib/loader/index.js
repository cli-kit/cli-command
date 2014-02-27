var fs = require('fs');
var markzero = require('markzero');
var manual = markzero.manual;
var marked = markzero.marked;
var Parser = markzero.Parser;
var ProgramRenderer = require('./renderer');

var options = new RegExp('^' + manual.OPTIONS + '$', 'i');
var commands = new RegExp('^' + manual.COMMANDS + '$', 'i');

function parse(markdown, def, callback) {
  // TODO: get lexer configuration
  var lexer = new marked.Lexer({});
  var tokens = lexer.lex(markdown);
  //console.dir(tokens);
  // take name from h1
  if(tokens.length
    && tokens[0].type === 'heading'
    && tokens[0].depth === 1) {
    this.name(tokens[0].text);
    tokens.shift();
  }

  // remove subsequent heading
  // taking care not to remove specially
  // recognized headings
  if(tokens.length
    && tokens[0].type === 'heading'
    && tokens[0].depth === 2
    && !options.test(tokens[0].text)
    && !commands.test(tokens[0].text)) {
    tokens.shift();
  }

  // take description from first paragraph
  if(tokens.length
    && tokens[0].type === 'paragraph') {
    this.description(tokens[0].text);
    tokens.shift();
  }
  //console.dir(tokens);
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
