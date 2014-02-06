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
  var arg, z, parts = [], width, i, part;
  width = longest.call(this, this._arguments);
  width = longest.call(this, this._commands, width);
  //parts.push('', {lead: repeat(), name: title}, '');
  console.log();
  console.log(repeat() + title);
  console.log();
  for(z in target) {
    arg = target[z];
    parts.push({
      lead: repeat(4), name: pad(arg.name(), width + 1),
      pad: repeat(), desc: arg.description()
    });
    //parts.push(repeat(4) + pad(arg.name(), width + 1) +
      //repeat() + arg.description());
  }
  //console.log(parts.join('\n'));
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    //if(part === '') {
      //console.log();
      //continue;
    //}
    console.log(part.lead + '%s ' +
      (part.pad || '') + (part.desc || ''), part.name);
  }
}

function head() {
  console.log();
}

function usage() {
  var custom = this.usage();
  if(typeof custom == 'string') return console.log(repeat() +
    '%s ' + custom, this.name());
  var cmds = Object.keys(this._commands);
  var args = Object.keys(this._arguments);
  var parts = [];
  if(cmds.length) parts.push('[command]');
  if(args.length) parts.push('[options]');
  console.log(repeat() + '%s ' + parts.join(' '), this.name());
}

function commands() {
  var cmds = Object.keys(this._commands);
  if(!cmds.length) return;
  section.call(this, this._commands, 'Commands:');
}

function options() {
  var args = Object.keys(this._arguments);
  if(!args.length) return;
  section.call(this, this._arguments, 'Options:');
}

function foot() {
  console.log();
}

module.exports = function() {
  var config = this.configuration();
  module.exports.head.call(this);
  module.exports.usage.call(this);
  module.exports.commands.call(this);
  module.exports.options.call(this);
  module.exports.foot.call(this);
  if(config.exit) process.exit();
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
