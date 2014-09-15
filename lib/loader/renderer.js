var EOL = require('os').EOL;
var util = require('util');
var markzero = require('markzero');
var manual = markzero.manual;
var MarkdownRenderer = markzero.MarkdownRenderer;
var ltrim = require('cli-util').ltrim;
var define = require('cli-define');
var Option = define.Option;
var Command = define.Command;
var ConverterMap = require('../util/map');

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
  this.conf = cli.configure();
  this.conf.help = this.conf.help || {};
  this.conf.help.sections = {};
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
  //console.log('getParentCommand %s', parent.key());
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
  this.level = level;
  if(level === 2 || level === 4) {
    this.last = null;
    //this.parent = this.cli;
    for(var z in re) {
      //console.log('testing re %s', z, re[z]);
      if(re[z].test(text)) {
        this.section = z;
        //console.log('got section %s', z.toUpperCase());
        if(this.section !== manual.OPTIONS
           && this.section !== manual.COMMANDS
           && this.section !== manual.DESCRIPTION) {
          this.conf.help.sections[this.section] = '';
          this.custom = level;
          //console.log('creating custom known section %s', this.section);
        }
        break;
      }else{
        // TODO: unknown sections should be added as custom help sections
        this.section = text;
        //console.log('creating custom unknown section %s', this.section);
        this.conf.help.sections[this.section.toLowerCase()] = '';
        this.custom = level;
      }
    }
  // adding options/commands to an existing command
  }else if(level === 3) {
    //console.log('using command %s', text);
    this.section = null;
    this.parent = this.getParentCommand(text);
    //console.log('set parent command to %s', this.parent.key());
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

  if(this.custom
    && token.type === 'heading'
    && (this.custom === 4 && token.depth <= this.custom)) {
    //console.log('append custom heading... %s', token.text);
    //console.log('clear custom heading on %j', token);
    this.custom = null;
  }

  if(this.section === manual.EXAMPLES) {
    if(token.type === 'paragraph' && next.type === 'code') {
      this.examples.push({name: next.text, description: token.text});
    }
  }

  // copyright may only be a single paragraph
  else if(this.section === COPYRIGHT) {
    if(token.type === 'paragraph') {
      this.cli.configure().copyright = token.text;
    }
  }

  // custom level 2 sections, such as history
  else if(this.level === 2 || this.level === 4 && this.custom && this.section
    && this.section !== manual.OPTIONS && this.section !== manual.COMMANDS) {
    if(token.raw && !this.inList) {
      var append = true;
      if(this.custom === 2 && next
        && token.type === 'heading' && token.depth >= 2) {
        this.custom = null;
        append = false;
      }
      // adding to top-level sections
      if(this.level === 2) {
        //console.log('adding to top-level %s %s', this.section, append);
        if(append) this.conf.help.sections[this.section.toLowerCase()] += token.raw;
      }else if(this.level === 4 && this.parent) {
        this.parent.sections = this.parent.sections || {};
        var item = this.parent.sections[this.section.toLowerCase()];
        if(!item) {
          item = this.parent.sections[this.section.toLowerCase()] || {
            title: this.section,
            text: ''
          }
        }
        //console.log('adding %s', token.raw);
        item.text
          += token.raw;
        this.parent.sections[this.section.toLowerCase()] = item;
      }
    }
  }

  // concat descriptions to existing description
  // for commands
  else if(this.section === manual.DESCRIPTION && this.level === 4
    && token.type !== 'heading' && this.parent) {
    var add = true;
    if(/^list/.test(token.type) && token.type !== 'list_start' || this.inList) {
      add = false;
    }
    if(add) {
      var detail = this.parent.detail();
      if(!detail) {
        this.parent.detail(token.raw);
      }else{
        detail.md += EOL + EOL + token.raw;
        this.parent.detail(detail.md);
      }
    }
  }

  else if(token.type === 'paragraph') {
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

  // reset parent variables
  if((this.parent !== this.cli
    && next
    && next.type === 'heading' && (next.depth < 4))) {
    this.section = null;
    this.parent = this.cli;
  }

  // keep track of whether we are in a list
  switch(token.type) {
    case 'list_start':
      this.inList = true;
      break;
    case 'list_end':
      this.inList = false;
      break;
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

  //console.log('current: %j', this.current);
  //console.dir(this.current);
  //console.dir(target);
  //console.log('got definition %j', definition);
  //console.log('got key %j', key);
  //console.log('got last key %j', last.key());
  //console.log('typeof definition target: %s', typeof(target[last.key()]));

  if(typeof definition === 'function' || Array.isArray(definition)
    || (definition instanceof ConverterMap)){
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

      //console.log('using object definition');
      //console.log('key %s', key);

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
  //console.log('parse option text %s', text);
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

    //console.log('added command "%s" to %s',
      //this.parent.last().key(), this.parent.key());
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
