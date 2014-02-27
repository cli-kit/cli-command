var util = require('util');
var markzero = require('markzero');
var marked = markzero.marked;
var manual = markzero.manual;
var MarkdownRenderer = markzero.TextRenderer;
var ltrim = require('cli-util').ltrim;
var define = require('cli-define');
var Option = define.Option;
var Command = define.Command;

var COPYRIGHT = 'copyright';
var re = {};
var layout = manual.layout.slice(0);
layout.push(COPYRIGHT);
layout.forEach(function(key) {
  re[key] = new RegExp('^' + key + '$', 'i');
})

// process these sections
var known = [manual.NAME, manual.DESCRIPTION, manual.COMMANDS, manual.OPTIONS];

function Renderer(options, cli, def) {
  MarkdownRenderer.apply(this, arguments);
  // which section are we in
  this.section = null;
  this.cli = cli;
  this.def = def;
  def.options = def.options || {};
  def.commands = def.commands || {};
  this.def = def;
  this.examples = [];
}

util.inherits(Renderer, MarkdownRenderer);

Renderer.prototype.heading = function(text, level, raw) {
  this.section = null;
  if(level == 2) {
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

Renderer.prototype.code = function(code, lang, escaped) {
  if(this.section === manual.SYNOPSIS) {
    this.cli.usage(code);
  }
}

Renderer.prototype.token = function(token, parser) {
  var next = parser.peek();
  if(this.section === manual.EXAMPLES) {
    if(token.type === 'paragraph' && next.type === 'code') {
      this.examples.push({name: next.text, description: token.text});
    }
  // copyright may only be a single paragraph
  }else if(this.section === COPYRIGHT) {
    if(token.type === 'paragraph') {
      this.cli.configure().copyright = token.text;
    }
  }
  //console.dir(next);
  if(!next) this.end();
}

Renderer.prototype.end = function() {
  var conf = this.cli.configure();
  conf.help = conf.help || {};
  conf.help.sections = conf.help.sections || {};
  if(this.examples.length) {
    conf.help.sections[manual.EXAMPLES] = this.examples;
  }
}

Renderer.prototype.merge = function(key) {
  var last = this.cli.last();
  var definition = this.def[key][last.key()];
  if(typeof definition === 'function') {
    // set converter for options
    if(last instanceof Option) {
      last.converter(definition);
    // set actions for commands
    }else if(last instanceof Command) {
      last.action(definition);
    }
  // object definition, merge into option
  }else if(definition
    && typeof definition === 'object'
    && !Array.isArray(definition)) {
    var mutators = (last instanceof Command) ?
      Object.keys(define.mutators.cmd) : Object.keys(define.mutators.arg);

    // cannot override calculated data
    delete definition.name;
    delete definition.extra;
    delete definition.names;

    define.initialize.call(last, definition, mutators);
  }
}

Renderer.prototype.addOption = function(text) {
  var ind = text.indexOf(':');
  var name = text.substr(0, ind);
  var description = ltrim(text.substr(ind + 1));
  var data, args = [name, description];
  if(this.section === manual.OPTIONS) {
    this.cli.option(name, description);
  }else if(this.section === manual.COMMANDS) {
    this.cli.command(name, description);
  }
  this.merge(this.section);
}

Renderer.prototype.listitem = function(text, start, end) {
  if(this.section === manual.OPTIONS || this.section === manual.COMMANDS) {
    this.addOption(text);
  }
  return text;
};

//Renderer.prototype.paragraph = function(text){}

module.exports = Renderer;
