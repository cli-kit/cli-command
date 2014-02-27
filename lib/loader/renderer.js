var util = require('util');
var markzero = require('markzero');
var marked = markzero.marked;
var manual = markzero.manual;
var MarkdownRenderer = markzero.TextRenderer;

var re = {};
manual.layout.forEach(function(key) {
  re[key] = new RegExp('^' + key + '$', 'i');
})
console.dir(re);


function Renderer(options) {
  MarkdownRenderer.apply(this, arguments);
  this.assigned = {};
}

util.inherits(Renderer, MarkdownRenderer);

Renderer.prototype.heading = function(text, level, raw) {
  //console.dir(this.cli);
  if(level === 1 && !this.assigned.name) {
    this.cli.name(text);
    this.assigned.name = true;
  }else if(level == 2) {
    //console.dir(text);
  }
}

Renderer.prototype.token = function(token, parser){}

Renderer.prototype.list = function(body, ordered, next){
  console.dir('list: ' + body);
}

Renderer.prototype.paragraph = function(text){}

Renderer.prototype.strong = function(text){}

Renderer.prototype.em = function(text){}

Renderer.prototype.codespan = function(text){
  console.dir('got code span');
  return text;
}

module.exports = Renderer;
