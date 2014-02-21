var util = require('cli-util');
var pad = util.pad, repeat = util.repeat, wrap = util.wrap;
var json = require('./json').json;
var stringify = require('./json').stringify;
var markdown = require('./markdown');

//var converters = {
  //json: stringify,
  //md: markdown
//}
//
var converters = require('./doc');

var COMMANDS = 'commands';
var OPTIONS = 'options';
var titles = {};
titles[COMMANDS] = 'Commands:';
titles[OPTIONS] = 'Options:';

function longest(target, max) {
  var mx = max || 0, z;
  for(z in target) {
    mx = Math.max(mx, target[z].name().length);
  }
  return mx;
}

function section(target, title) {
  var conf = this.configure();
  var arg, parts = [], width, i, part, desc;
  var vanilla = conf.help && conf.help.vanilla;
  width = longest.call(this, this._options);
  width = longest.call(this, this._commands, width);
  if(title) {
    console.log();
    console.log(title);
  }
  console.log();

  var keys = Object.keys(target);
  var col = (conf.help && conf.help.column) ? conf.help.column : 80;
  if(conf.help.sort !== false) {
    keys = typeof(conf.help.sort) == 'function'
      ? keys.sort(conf.help.sort) : keys.sort();
  }
  for(i = 0;i < keys.length;i++) {
    arg = target[keys[i]];
    desc = process.env.CLI_TOOLKIT_HELP2MAN
      ? arg.description()
      : wrap(arg.description(), 4 + width + 1, col);
    if(vanilla) {
      parts.push(repeat() + pad(arg.name(), width + 1) +
        repeat() + desc);
    }else{
    parts.push({
      lead: repeat(), name: pad(arg.name(), width + 1),
      pad: repeat(), desc: desc
    });
    }
  }
  if(vanilla) return console.log(parts.join('\n'));
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    console.log(part.lead + '%s' + part.pad + part.desc, part.name);
  }
}

function head() {
  //console.log();
}

function usage() {
  var conf = this.configure();
  var vanilla = conf.help && conf.help.vanilla;
  var custom = this.usage();
  var parts = [];
  if(typeof custom == 'string') {
    parts = [custom];
  }else{
    var cmds = Object.keys(this._commands);
    var args = Object.keys(this._options);
    if(cmds.length) parts.push('[command]');
    if(args.length) parts.push('[options]');
  }
  var title = 'Usage: ';
  if(vanilla) {
    console.log(title + this.name() + ' ' + parts.join(' '));
  }else{
    console.log(title + '%s ' + parts.join(' '), this.name());
  }
  var desc = !conf.help || conf.help.description !== false
    || process.env.CLI_TOOLKIT_HELP2MAN;
  if(desc && this.description()) {
    console.log();
    console.log(this.description());
  }
}

function title(key) {
  var conf = this.configure();
  if(!conf.help
    || conf.help.title === false);
  if(conf.help.title === true) {
    return titles[key];
  }else if(conf.help.title && conf.help.title[key]) {
    return conf.help.title[key];
  }
  return false;
}

function commands() {
  var cmds = Object.keys(this._commands);
  if(!cmds.length) return;
  section.call(this, this._commands, title.call(this, COMMANDS));
}

function options() {
  var args = Object.keys(this._options);
  if(!args.length) return;
  section.call(this, this._options, title.call(this, OPTIONS));
}

function foot() {
  console.log();
}

module.exports = function(alive) {
  var config = this.configure();
  if(!process.env.CLI_TOOLKIT_HELP2MAN) {
    var prefix = 'CLI_TOOLKIT_HELP_', key;
    for(var z in converters) {
      key = prefix + z.toUpperCase();
      if(process.env[key]) return converters[z].call(this);
    }
  }

  //if(!process.env.CLI_TOOLKIT_HELP2MAN) {
    //var prefix = 'CLI_TOOLKIT_HELP_', key;
    //for(var z in converters) {
      //key = prefix + z.toUpperCase();
      //if(process.env[key]) return process.stdout.write(converters[z].call(this));
    //}
  //}
  //var config = this.configure();
  //module.exports.head.call(this);
  //module.exports.usage.call(this);
  //module.exports.commands.call(this);
  //module.exports.options.call(this);
  //module.exports.foot.call(this);
  this.emit('help');
  if(config.exit && alive !== true) process.exit();
  return false;
}

module.exports.json = json;
module.exports.stringify = stringify;
module.exports.head = head;
module.exports.usage = usage;
module.exports.commands = commands;
module.exports.options = options;
module.exports.foot = foot;

// utilities
module.exports.pad = pad;
module.exports.repeat = repeat;
module.exports.longest = longest;
module.exports.section = section;
