var util = require('cli-util');
var pad = util.pad, repeat = util.repeat;

function longest(target, max) {
  var mx = max || 0, z;
  for(z in target) {
    mx = Math.max(mx, target[z].name().length);
  }
  return mx;
}

function section(target, title) {
  var conf = this.configure();
  var arg, parts = [], width, i, part;
  var vanilla = conf.help && conf.help.vanilla;
  width = longest.call(this, this._options);
  width = longest.call(this, this._commands, width);
  console.log();
  console.log(repeat() + title);
  console.log();
  var keys = Object.keys(target);
  if(conf.help.sort !== false) {
    keys = typeof(conf.help.sort) == 'function'
      ? keys.sort(conf.help.sort) : keys.sort();
  }
  for(i = 0;i < keys.length;i++) {
    arg = target[keys[i]];
    if(vanilla) {
      parts.push(repeat(4) + pad(arg.name(), width + 1) +
        repeat() + arg.description());
    }else{
    parts.push({
      lead: repeat(4), name: pad(arg.name(), width + 1),
      pad: repeat(), desc: arg.description()
    });
    }
  }
  if(vanilla) return console.log(parts.join('\n'));
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    console.log(part.lead + '%s ' +
      (part.pad || '') + (part.desc || ''), part.name);
  }
}

function head() {
  console.log();
}

function usage() {
  var conf = this.configure();
  var vanilla = conf.help && conf.help.vanilla;
  var custom = conf.usage;
  var parts = [];
  if(typeof custom == 'string') {
    parts = [custom];
  }else{
    var cmds = Object.keys(this._commands);
    var args = Object.keys(this._options);
    if(cmds.length) parts.push('[command]');
    if(args.length) parts.push('[options]');
  }
  if(vanilla) {
    console.log(repeat() + this.name() + ' ' + parts.join(' '));
  }else{
    console.log(repeat() + '%s ' + parts.join(' '), this.name());
  }
}

function commands() {
  var cmds = Object.keys(this._commands);
  if(!cmds.length) return;
  section.call(this, this._commands, 'Commands:');
}

function options() {
  var args = Object.keys(this._options);
  if(!args.length) return;
  section.call(this, this._options, 'Options:');
}

function foot() {
  console.log();
}

module.exports = function(alive) {
  var config = this.configure();
  module.exports.head.call(this);
  module.exports.usage.call(this);
  module.exports.commands.call(this);
  module.exports.options.call(this);
  module.exports.foot.call(this);
  if(config.exit && alive !== true) process.exit();
  return false;
}

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
