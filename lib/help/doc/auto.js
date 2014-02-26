var util = require('util');
var define = require('cli-define');
var utils = require('cli-util');
var wrap = utils.wrap, merge = utils.merge;
var Flag = define.Flag;
var Option = define.Option;

var HYPHEN = '-';

/**
 *  Expansions creates an expansion prefix for all short option flags,
 *  eg: [-xvf].
 *
 *  Flags includes flag long options in the output, eg: [--version].
 *
 *  Combine overrides flags to show all names for flag options, eg:
 *  [-V|--version]
 *
 *  No expands --[no] options to two values, eg: [--no-color|--color]
 *
 *  Options indicates whether options should be included in the ouput,
 *  eg: [--log-level=[level]] or [--option=<value>] depending upon the
 *  option declaration.
 *
 *  Semantic when false removes the difference between --option=[value]
 *  and --option=<value> and forces all options to use angle brackets
 *  which is more aesthetically pleasing than nested square brackets.
 *
 *  Upper converts options with values to uppercase, eg: [--file=<FILE>].
 *
 *  Values is a map between option keys and acceptable values, if a value
 *  if found then it it used, such as: [--format=<foo|bar>] where values
 *  contains {format: ['foo', 'bar']}. Especially useful for enum types.
 *
 *  Command includes a <command> string after flags and options.
 *
 *  Args adds an <args> string at the end of the usage.
 */
var defaults = {
  list: '|',
  range: '-',
  start: '[',
  end: ']',
  gstart: '(',
  gend: ')',
  rstart: '<',
  rend: '>',
  expansions: true,
  flags: true,
  combine: true,
  no: true,
  options: true,
  semantic: false,
  upper: false,
  values: {},
  command: true,
  args: true
}

function getOptionValue(arg, conf) {
  var extra = (arg.extra() || '')
  if(!conf.semantic) {
    extra = extra
      .replace('[', '<')
      .replace(']', '>');
  }
  var custom = conf.values[arg.key()];
  var gstart = conf.gstart, gend = conf.gend;
  if(custom) {
    if(Array.isArray(custom)) {
      var delimiter = conf.list;
      var range = custom.length == 2
        && typeof(custom[0]) === 'number'
        && typeof(custom[1]) === 'number';
      if(range) {
        delimiter = conf.range;
        gstart = conf.rstart;
        gend = conf.rend;
      }

      custom = custom.slice(0);
      // coerce array values to strings so null is listed
      custom.forEach(function(val, index, arr) {
        arr[index] = '' + val;
      });
      extra = gstart + custom.join(delimiter) + gend;
    }else if(typeof custom === 'string'
      || typeof custom === 'number') {
      extra = '' + custom;
    }
  }
  if(conf.upper) {
    extra = extra.toUpperCase();
  }
  return arg.getOptionString('|', null, null, extra);
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
  var start = conf.start, end = conf.end;
  var sre = /^-[a-zA-Z0-9]$/, lre = /^--/;
  var chars = '';
  var lng = [];
  var opts = this.cli._options, z, arg, names, i, options = [], str;
  for(z in opts) {
    arg = opts[z];
    if(arg instanceof Flag) {
      names = arg.names();
      for(i = 0;i < names.length;i++) {
        if(conf.expansions && sre.test(names[i])) {
          chars += names[i].substr(1);
        }else if(conf.flags && !conf.combine && lre.test(names[i])) {
          lng.push(start + names[i] + end);
        }
      }
      if(conf.combine) {
        if(conf.no) names = getNoExpansions(names);
        lng.push(start + names.join('|') + end);
      }
    }else if(arg instanceof Option){
      if(conf.options) {
        options.push(start + getOptionValue(arg, conf) + end);
      }
    }
  }
  var expansions = chars.length ? start + HYPHEN + chars + end : '';
  if(expansions) parts.push(expansions);
  if(lng.length) parts.push(lng.join(' '));
  if(options.length) parts.push(options.join(' '));
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
    //console.dir(conf);
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
