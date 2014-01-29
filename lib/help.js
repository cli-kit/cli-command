function repeat(amount, str) {
  amount = amount || 2;
  return new Array(amount + 1).join(str || ' ');
}

function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + repeat(len + 1);
}

function longest(target, max) {
  var mx = max || 0, z;
  for(z in target) {
    mx = Math.max(mx, target[z].name.length);
  }
  return mx;
}

function section(target, title) {
  var arg, z, parts = [], width;
  width = longest.call(this, this._arguments);
  width = longest.call(this, this._commands, width);
  parts.push('', repeat() + title, '');
  for(z in target) {
    arg = target[z];
    parts.push(repeat(4) + pad(arg.name, width)
      + repeat() + arg._description);
  }
  console.log(parts.join('\n'));
}

function head() {
  console.log();
}

function usage() {
  if(this._usage) return console.log(repeat() + this._name + ' ' + this._usage);
  var cmds = Object.keys(this._commands);
  var args = Object.keys(this._arguments);
  var parts = [this._name];
  if(cmds.length) parts.push('[command]');
  if(args.length) parts.push('[options]');
  console.log(repeat() + parts.join(' '));
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
  head.call(this);
  usage.call(this);
  commands.call(this);
  options.call(this);
  foot.call(this);
  process.exit();
}

module.exports.head = head;
module.exports.usage = usage;
module.exports.commands = commands;
module.exports.options = options;
module.exports.foot = foot;
