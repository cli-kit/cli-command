var EOL = require('os').EOL;
var util = require('util');
var markzero = require('markzero');
var marked = markzero.marked;
var manual = markzero.manual;
var MarkdownRenderer = markzero.MarkdownRenderer;
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
  def = def || {};
  // which section are we in
  this.section = null;
  //this.subsection = null;
  this.cli = cli;
  this.parent = this.cli;
  this.def = def;
  this.current = def;
  def.options = def.options || {};
  def.commands = def.commands || {};
  this.def = def;
  this.examples = [];
}

util.inherits(Renderer, MarkdownRenderer);

Renderer.prototype.getParentCommand = function(text, parent) {
  parent = parent || this.parent;
  text = text.toLowerCase();
  //console.log('testing with command text %s on parent %s', text, parent.key());
  var re = new RegExp('^' + parent.key(), 'i');
  if(re.test(text)) {
    return parent;
  }
  var cmds = parent.commands();
  var z;
  for(z in cmds) {
    //console.log('testing with key: %s', z);
    re = new RegExp('^' + z, 'i');
    if(re.test(text)) {
      return cmds[z];
    }
  }
  this.cli.raise('failed to locate command for level 3 heading %s', [text]);
  //return null;
}

Renderer.prototype.heading = function(text, level, raw) {
  this.section = null;
  if(level === 2 || level === 4) {
    this.last = null;
    //this.parent = this.cli;
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
  // adding options/commands to an existing command
  }else if(level === 3) {
    this.section = null;
    this.parent = this.getParentCommand(text) || this.cli;
    if(this.def.commands) {
      this.current = this.def.commands[this.parent.key()] || {};
      //console.dir(this.current);
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

  if(token.type === 'paragraph') {
    // this adds a detail for commands by defining paragraphs below the
    // command level 3 heading but before the level 4 child options/commands
    if(this.parent !== this.cli && this.section === null) {
      var detail = this.parent.detail();
      if(!detail) {
        this.parent.detail(token.text);
      }else{
        detail.md += EOL + EOL + token.text;
        this.parent.detail(detail.md);
      }
    // this handles command/option descriptions with hard-line breaks
    // in the list description
    }else if(this.last) {
      var desc = this.last.description();
      desc.md += EOL + EOL + token.text;
      this.last.description(desc.md);
    }
  }

  if(token.type === 'list_end') {
    this.section = null;
    this.parent = this.cli;
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
  var last = this.last = this.parent.last();
  //console.log('merge defs: %j', last.names());
  //console.dir(this.def);
  var target = this.current[key] || {};
  var definition = target[last.key()];
  //console.log('got definition %j', definition);
  //console.log('got key %j', key);
  //console.log('got last key %j', last.key());
  if(typeof definition === 'function') {
    //console.log('func: ' + definition);
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

    //console.log('merging in mutators: %j', mutators);

    // cannot override calculated data
    delete definition.name;
    delete definition.extra;
    delete definition.names;

    define.initialize.call(last, definition, mutators);
  }
}

Renderer.prototype.parseListItemText = function(text) {
  var info = {};
  var re = /^(`)(\!?)([^`]+)(`)(\s*:\s*)(.*)/;
  text.replace(re, function(
    match, backtick, exec, name, backtick, delimiter, description) {
    info.name = name;
    info.exec = !!exec;
    info.description = description;
  });
  return info;
}

Renderer.prototype.addOption = function(text, cmd) {
  cmd = cmd || this.cli;
  //console.log('add option to %s', cmd.names());
  var info = this.parseListItemText(text);
  //console.dir(info);
  if(this.section === manual.OPTIONS) {
    cmd.option(info.name, info.description);
  }else if(this.section === manual.COMMANDS) {
    //console.log('adding command: %s', info.name);
    // add as an external executable
    if(info.exec) {
      cmd.command(info.name, info.description);
    // add as an action executable
    }else{
      cmd.command(info.name);
      this.parent.last().description(info.description);
    }
    //console.log('added command %s', this.parent.last().key());
  }
  this.merge(this.section);
}

Renderer.prototype.listitem = function(text, start, end) {
  if(this.section === manual.OPTIONS || this.section === manual.COMMANDS) {
    this.addOption(text, this.parent);
  }
  return text;
};

//Renderer.prototype.paragraph = function(text){}

module.exports = Renderer;
