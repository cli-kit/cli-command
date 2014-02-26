var util = require('util');
var define = require('cli-define');
var utils = require('cli-util');
var wrap = utils.wrap, merge = utils.merge;
var Flag = define.Flag;

var START = '[';
var END = ']';
var HYPHEN = '-';

/**
 *  Expansions creates an expansion prefix for all short option flags.
 *
 *  Flags includes flag long options in the output.
 *
 *  Combine overrides flags to show all names for flag options.
 */
var defaults = {
  expansions: true,
  flags: true,
  combine: true,
  no: true,
  options: true,
}

/**
 *  Expand --[no]- to multiple option names.
 */
function getNoExpansions(names) {
  var output = [];
  names.forEach(function(name) {
    if(define.re.no().test(name)) {
      var yes = name.replace(define.re.no(), '');
      var no = name.replace(/^(-+)\[?(no)\]?-?(.*)/, "$1$2-$3");
      output.push(yes, no);
    }else{
      output.push(name);
    }
  })
  return output;
}

/**
 *  Get option usage string(s).
 */
function getOptions(conf) {
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
      }else if(conf.flags && !conf.combine && lre.test(names[i])) {
        lng.push(START + names[i] + END);
      }
    }
    if(conf.combine) {
      if(conf.no) names = getNoExpansions(names);
      lng.push(START + names.join('|') + END);
      //continue;
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
    parts = parts.concat(getOptions.call(this, conf));
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
