var EOL = require('os').EOL;
var fs = require('fs');
var markzero = require('markzero');
var manual = markzero.manual;
var marked = markzero.marked;
var Parser = markzero.Parser;
var ProgramRenderer = require('./renderer');

var options = new RegExp('^' + manual.OPTIONS + '$', 'i');
var commands = new RegExp('^' + manual.COMMANDS + '$', 'i');

var environment = require('./environment');

function parse(markdown, def, env, callback) {

  var data = {
    0: this.name(),
    description: this.description()
  }

  // TODO: get lexer configuration
  var lexer = new marked.Lexer();
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

  // take description from initial paragraph(s)
  var description = '';
  while(tokens.length
    && tokens[0].type === 'paragraph') {
    description +=  !description ? tokens[0].text  : EOL + EOL + tokens[0].text;
    tokens.shift();
  }
  if(description) this.description(description);
  //console.dir(tokens);
  var renderer = new ProgramRenderer(null, this, def);
  var parser = new Parser({renderer: renderer});
  parser.parse(tokens);
  if(env) {
    environment.call(this, data, this.configure().load.escape);
  }
  callback();
}

function loader(file, def, env, callback) {
  var scope = this;
  fs.exists(file, function(exists) {
    if(!exists) return callback(scope.errors.EEXIST, [file]);
    fs.readFile(file, function(err, contents) {
      if(err) return callback(err);
      contents = '' + contents;
      parse.call(scope, contents, def, env, callback);
    })
  })
}

module.exports = loader;
