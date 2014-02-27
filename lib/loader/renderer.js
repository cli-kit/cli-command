var util = require('util');
var markzero = require('markzero');
var marked = markzero.marked;
var manual = markzero.manual;
var MarkdownRenderer = markzero.TextRenderer;
var ltrim = require('cli-util').ltrim;

var re = {};
manual.layout.forEach(function(key) {
  re[key] = new RegExp('^' + key + '$', 'i');
})

// process these sections
var known = [manual.NAME, manual.DESCRIPTION, manual.COMMANDS, manual.OPTIONS];

function Renderer(options) {
  MarkdownRenderer.apply(this, arguments);
  // which section are we in
  this.section = null;
}

util.inherits(Renderer, MarkdownRenderer);

Renderer.prototype.heading = function(text, level, raw) {
  this.section = null;
  if(level == 2) {
    //console.dir(text);
    for(var z in re) {
      if(re[z].test(text)) {
        this.section = z;
        // TODO: add help section information
        break;
      }else{
        // TODO: unknown sections should be added as custom help sections
        this.section = 'unknown';
      }
    }
  }
}

Renderer.prototype.token = function(token, parser){}

Renderer.prototype.list = function(body, ordered, next){
  console.dir('list: ' + body);
}

Renderer.prototype.addOption = function(text) {
  var ind = text.indexOf(':');
  var name = text.substr(0, ind);
  var description = ltrim(text.substr(ind + 1));
  console.log('name %s', name);
  console.log('description %s', description);
}

Renderer.prototype.listitem = function(text, start, end) {
  if(this.section === manual.OPTIONS || this.section === manual.COMMANDS) {
    this.addOption(text);
  }
  console.dir('in list item : ' + text);
  console.log('section is %s', this.section);
  return text;
};

Renderer.prototype.paragraph = function(text){}

Renderer.prototype.strong = function(text){}

Renderer.prototype.em = function(text){}

Renderer.prototype.codespan = function(text){
  console.log('got code span %s', text);
  console.log('section is %s', this.section);
  return text;
}

module.exports = Renderer;
