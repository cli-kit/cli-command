var util = require('util');
var utils = require('cli-util');
var wrap = utils.wrap, merge = utils.merge;
var Flag = require('cli-define').Flag;

var START = '[';
var END = ']';
var HYPHEN = '-';

var defaults = {
  expansions: true,
  flags: true,
  options: true,
}

/**
 *  Get short option flag expansion.
 */
function getFlags(conf) {
  var parts = [];
  if(!conf.expansions && !conf.flags) return parts;
  var sre = /^-[a-zA-Z0-9]$/, lre = /^--/;
  var chars = '';
  var lng = [];
  var opts = this.cli._options, z, arg, names, i;
  for(z in opts) {
    arg = opts[z];
    if(!(arg instanceof Flag)) continue;
    names = arg.names();
    for(i = 0;i < names.length;i++) {
      if(conf.expansions && sre.test(names[i])) {
        chars += names[i].substr(1);
      }else if(conf.flags && lre.test(names[i])) {
        lng.push(START + names[i] + END);
      }
    }
  }
  var expansions = chars.length ? START + HYPHEN + chars + END : '';
  if(expansions) parts.push(expansions);
  if(lng.length) parts.push(lng.join(' '));
  return parts;
}

/**
 *  Build usage string automatically from the program
 *  options and commands.
 *
 *  Scope is the help document.
 */
module.exports = function auto(wrapped, name, prefix) {
  var parts = [], value = this.cli._usage;
  // custom string
  if(typeof value === 'string') {
    parts = [value];
  // completely disabled
  }else if(value === false) {
    return parts;
  // simple default style
  }else if(value === null) {
    var cmds = Object.keys(this.cli._commands);
    var args = Object.keys(this.cli._options);
    if(cmds.length) parts.push(this.messages.usage.command);
    parts.push(this.messages.usage.option);
  // automatic generation (default)
  }else if(value === undefined || typeof(value) === 'object') {
    var conf = merge(defaults, {});
    conf = merge(value ? value : (this.conf.usage || {}), conf);
    parts = parts.concat(getFlags.call(this, conf));
  }

  parts = ['%s ' + parts.join(' ')];
  if(wrapped) {
    var usage = parts.join();
    var len = prefix.length + name.length + 1;
    usage = wrap(usage, len, this.limit - len);
    return util.format(prefix + usage, name);
  }

  return parts;
}
