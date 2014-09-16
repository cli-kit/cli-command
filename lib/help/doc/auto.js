var EOL = require('os').EOL;
var util = require('util');
var define = require('cli-define');
var utils = require('cli-util');
var wrap = utils.wrap, merge = utils.merge, repeat = utils.repeat;
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
  sgroup: '(',
  egroup: ')',
  srange: '<',
  erange: '>',
  sargs: '<',
  eargs: '>',
  scommand: '<',
  ecommand: '>',
  expansions: true,
  flags: true,
  combine: true,
  no: true,
  options: true,
  semantic: false,
  upper: false,
  values: {},
  command: true,
  prepend: true,
  args: true
}

function getOptionValue(arg, conf) {
  var extra = (arg.extra() || '')
  extra = extra.replace(/\s+(.+)/, '$1');
  if(!conf.semantic) {
    extra = extra
      .replace('[', '<')
      .replace(']', '>');
  }
  var custom = conf.values[arg.key()];
  var sgroup = conf.sgroup, egroup = conf.egroup;
  if(custom) {
    if(Array.isArray(custom)) {
      var delimiter = conf.list;
      var range = custom.length == 2
        && typeof(custom[0]) === 'number'
        && typeof(custom[1]) === 'number';
      if(range) {
        delimiter = conf.range;
        sgroup = conf.srange;
        egroup = conf.erange;
      }

      custom = custom.slice(0);
      // coerce array values to strings so null is listed
      custom.forEach(function(val, index, arr) {
        arr[index] = '' + val;
      });
      extra = sgroup + custom.join(delimiter) + egroup;
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
      //var yes = name.replace(define.re.no(), '');
      //var no = name.replace(/^(-+)\[?(no)\]?-?(.*)/, "$1$2-$3");
      var variants = define.getNoVariants(name);
      output.push(variants.yes, variants.no);
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
  var opts = this.cmd._options, z, arg, names, i, options = [], str;
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
  var commands = Object.keys(this.cmd._commands).length > 0;
  if(commands && conf.command && conf.prepend) {
    parts.push(conf.scommand
      + this.messages.usage.command + conf.ecommand);
  }
  if(expansions) parts.push(expansions);
  if(lng.length) parts.push(lng.join(' '));
  if(options.length) parts.push(options.join(' '));
  if(commands && conf.command && !conf.prepend) {
    parts.push(conf.scommand
      + this.messages.usage.command + conf.ecommand);
  }
  if(conf.args) {
    parts.push(conf.sargs
      + this.messages.usage.args + conf.eargs);
  }
  return parts;
}

/**
 *  Build usage string automatically from the program
 *  options and commands.
 *
 *  Scope is the help document.
 *
 *  @param wrapped Whether the synopsis should be wrapped.
 *  @param name The name to prefix, typically the program name.
 *  @param prefix A prefix to prepend to the first line, eg: 'Usage: '.
 *  @param nopad
 */
module.exports = function auto(wrapped, name, prefix, nopad) {
  var parts = [], value = this.cmd._usage, automatic;
  if(prefix) prefix = prefix.replace(/\s+$/, '');

  // word wrap variables
  var len = prefix.length + name.length + 2;
  var amount = this.limit - len;

  var conf = this.cli.configure();
  var synopsis = conf.synopsis;
  value = synopsis.usage !== undefined
    ? synopsis.usage : this.cmd._usage;
  //console.dir(synopsis);

  // custom string
  if(typeof value === 'string') {
    parts = [value];
  // completely disabled
  }else if(value === false) {
    return parts;
  // simple default style
  }else if(value === null) {
    var cmds = Object.keys(this.cmd._commands);
    var args = Object.keys(this.cmd._options);
    if(cmds.length
      && synopsis.commands) parts.push(
        defaults.srange + this.messages.usage.command + defaults.erange);
    if(synopsis.options) parts.push(
        defaults.srange + this.messages.usage.option + defaults.erange);
  // automatic generation (default)
  }else if(value === undefined
    || typeof(value) === 'object') {
    var conf = merge(defaults, {});
    conf = merge(value ? value : (this.conf.usage || {}), conf);
    //console.dir(conf);
    if(synopsis.options) {
      automatic = getOptions.call(this, conf);
    }
  }

  // add command name when building usage
  // for a specific command
  if(!this.isProgram()
    && (value === null || value === undefined || typeof value === 'object')) {
    var names = this.cmd.names();
    var str, extra = this.cmd.extra();
    for(var i = 0;i < names.length;i++) {
      // pad subsequent lines
      str = i ? repeat(prefix.length) : '';
      str += name + ' ' + names[i];
      if(automatic) str += ' ' + automatic.join(' ')
      str += extra ? ' ' + extra + EOL : EOL;
      if(wrapped) str = wrap(str, len, amount);
      parts.push(str);
    }

    // clear name as we are including it for each command alias
    //name = '';
    // prevent double newline in this scenario
    if(parts.length) {
      var last = parts.pop();
      last = last.replace(/\n$/, '');
      parts.push(last);
    }
    // disable wrapping as we handle wrapping
    wrapped = false;

    // add simple subcommand synopsis
    var subs = this.cmd.commands();
    var padding = !nopad && prefix ? repeat(prefix.length + 1) : '';
    var fmt = '\n%s%s %s %s <args> %s';
    for(var k in subs) {
      if(subs[k].extra()) {
        parts.push(
          util.format(
            fmt, padding, name, this.cmd.getShortName(),
            subs[k].getLongName(), subs[k].extra()));
      }else{
        parts.push(
          util.format(
            fmt.substr(0, fmt.length-3),
            padding, name, this.cmd.getShortName(), subs[k].getLongName()));
      }
    }

    // clear name as we have included it
    name = '';
  }else if(automatic) {
    parts = parts.concat(automatic);
  }
  //console.dir(parts);
  var format = '%s ' + parts.join(' ');
  parts = [format];
  if(wrapped) {
    var usage = parts.join();
    usage = wrap(usage, len, amount);
    parts = util.format(prefix + ' ' + usage, name);
  }else{
    //console.log('not wrapped');
    //console.dir(parts);
    parts = util.format(prefix + parts.join(), name);
  }

  //console.log('nopad %s', nopad);
  if(nopad) {
    parts = parts.split('\n');
    //console.log('got no pad %j', parts);
    parts = parts.map(function(value, index, arr) {
      return value.replace(/^ /, '');
    });
    //console.log('after %j', parts);
    parts = parts.join('\n');
  }
  //console.dir('final synopsis parts');
  //console.dir(parts);
  return parts;
}
