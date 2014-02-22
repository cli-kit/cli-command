var util = require('util');

var utils = require('cli-util');
var pad = utils.pad, repeat = utils.repeat, wrap = utils.wrap;

var INDENT = 1;
var COLUMN = 20;

var COLUMN_ALIGN = 'column';
var LINE_ALIGN = 'line';
var FLEX_ALIGN = 'flex';
var WRAP_ALIGN = 'wrap';
var align = [COLUMN_ALIGN, LINE_ALIGN, FLEX_ALIGN, WRAP_ALIGN];

var sections = [
  'name',
  'description',
  'synopsis',
  'commands',
  'options',
  'environment',
  'files',
  'examples',
  'exit',
  'history',
  'author',
  'bugs',
  'copyright',
  'see'
];

var headers = {
  synopsis: 'usage',
  arguments: 'arguments',
  see: 'see also'
};

// TODO: move to cli-util module
function ucfirst(val) {
  if(!val) return val;
  return val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 *  Abstract super class for help documents.
 *
 *  @param program The program instance.
 */
var HelpDocument = function(program) {
  this.cli = program;
  this.conf = this.cli.configure().help;
  this.messages = this.conf.messages;
  this.limit = this.conf.maximum ? this.conf.maximum : 80;
  this.usage = this.cli.usage();
  this.delimiter = this.conf.delimiter ? this.conf.delimiter : ', ';
  this.assignment = this.conf.assignment ? this.conf.assignment : '=';
  this.format = this.conf.align || COLUMN_ALIGN;
  if(!~align.indexOf(this.format)) this.format = COLUMN_ALIGN;
  this.sections = sections.slice(0);
  this.padding = this.conf.indent || INDENT;
  this.space = this.conf.space || repeat(this.padding);
  this.wraps = !process.env.CLI_TOOLKIT_HELP2MAN;
  this.width = COLUMN;
  this.headers = {};
  this.metrics = {};
  this.getMetrics();
  this.titles();
}

/**
 *  Write the name section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.name = function(data, stream) {}

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.synopsis = function(data, stream) {}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.description = function(data, stream) {}

/**
 *  Write the options section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.options = function(data, stream) {
  this.args(data, stream);
}

/**
 *  Write command options.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.commands = function(data, stream, doc) {
  var opts = Object.keys(this.cli._commands);
  if(!opts.length) return;
  return this._commands(data, stream, doc);
}

/**
 *  Write command options if any commands are defined.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype._commands = function(data, stream, doc) {
  this.title(HelpDocument.COMMANDS, data, stream, doc);
  return this.opts(
    this.cli._commands, HelpDocument.COMMANDS, data, stream, doc);
}

/**
 *  Write argument options.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.args = function(data, stream) {
  var opts = Object.keys(this.cli._options);
  return this._arguments(data, stream);
}

/**
 *  Write argument options if any arguments are defined.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype._arguments = function(data, stream) {
  this.title(HelpDocument.OPTIONS, data, stream);
  return this.opts(
    this.cli._options, HelpDocument.OPTIONS, data, stream);
}

/**
 *  Write a group of options.
 *
 *  @param target The object containing option definitions.
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.opts = function(target, data, stream) {}


/**
 *  Write the environment section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.environment = function(data, stream) {}

/**
 *  Write the files section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.files = function(data, stream) {}

/**
 *  Write the examples section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.examples = function(data, stream) {
  var enabled = this.hasSection(HelpDocument.EXAMPLES);
  if(!enabled) return false;
  var section = this.getSection(data, HelpDocument.EXAMPLES);
  if(section) {
    this.title(HelpDocument.EXAMPLES, data, stream);
    if(Array.isArray(section)) {
      this.printsection(section, stream);
      return true;
    }else if(typeof section === 'string') {
      return this.indent(section, null, data, stream);
    }
  }
}

/**
 *  Write the exit status section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.exit = function(data, stream) {
  var enabled = this.hasSection(HelpDocument.EXIT);
  if(!enabled) return false;
  var section = this.getSection(data, HelpDocument.EXIT);
  if(!section && this.conf.exit && data.errors) {
    // use exit status from program errors
    section = [];
    var errors = data.errors;
    var keys = Object.keys(errors), i, key;
    for(i = 0;i < keys.length;i++) {
      key = keys[i];
      section.push({
        code: errors[key].code, name: key + '(' + errors[key].code + ')',
        description: errors[key].description || ''});
    }
  }
  if(section) {
    this.title(HelpDocument.EXIT, data, stream);
    if(Array.isArray(section)) {
      this.printsection(section, stream);
      return true;
    }else if(typeof section === 'string') {
      return this.indent(section, null, data, stream);
    }
  }
}

/**
 *  Write the history section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.history = function(data, stream) {}

/**
 *  Write the author section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.author = function(data, stream) {}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.bugs = function(data, stream) {}

/**
 *  Write the copyright section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.copyright = function(data, stream) {}

/**
 *  Write the see also section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.see = function(data, stream) {}

/* UTILITY */

/**
 *  Align two string values to columns.
 *
 *  @param left The value for the left column.
 *  @param right The value for the right column.
 */
HelpDocument.prototype.column = function(left, right) {
  // account for primary leading space
  var column = this.width - this.padding;
  var lead = repeat(this.padding);
  var cols = this.format === COLUMN_ALIGN;
  var lines = this.format === LINE_ALIGN;
  var flex = this.format === FLEX_ALIGN;
  var breaks = lines || (left.length >= column && !flex);
  var rcol = this.metrics.maximum + this.space.length + this.padding;
  var diff = this.limit - column;
  // indent amount for description lines
  var lindent = repeat(column + this.padding);
  if(lines) {
    diff = this.limit - this.padding * 2;
    lindent = repeat(this.padding * 2);
  }else if(flex) {
    diff = this.limit - rcol;
    lindent = repeat(rcol);
  }
  if(right && this.wraps) {
    diff = Math.max(diff, 2);
    right = wrap(right, 0, diff);
    // pad remaining lines
    var list = right.split('\n');
    if(list.length > 1) {
      var remainder = list.slice(1).map(function(line) {
        return lindent + line;
      })
      right = list[0] + '\n' + remainder.join('\n');
    }
  }
  if(right && cols && breaks) {
    right = lead + repeat(column) + right;
  }else if(right && lines) {
    right = lindent + right;
  }else if(right && flex) {
    right = this.space + right;
    lead = '';
  }
  // description breaks onto newline
  if(breaks) right = '\n' + right;
  // right pad left column
  if(cols) {
    left = pad(left, column);
  }else if(flex) {
    left = pad(left, rcol - this.space.length, true);
  }
  return {lead: lead, left: left, right: right}
}


/**
 *  Retrieve a user-defined section.
 *
 *  @param data The help data object.
 */
HelpDocument.prototype.getSection = function(data, key) {
  return data.sections && data.sections[key] ?
    data.sections[key] : null;
}

/**
 *  Print a section defined as an array.
 */
HelpDocument.prototype.printsection = function(section, stream) {
  var i, left, right;
  var parts = [];
  for(i = 0;i < section.length;i++) {
    left = section[i].name || '';
    right = this.getDescription(section[i].description || '');
    if(!left) continue;
    parts.push(this.column(left, right));
  }
  this.printlines(parts, stream);
}

HelpDocument.prototype.printlines = function(parts, stream) {
  var i, part;
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    this.print(stream, part.lead + '%s' + part.right, part.left);
  }
}


/**
 *  Utility to remove a section by key from
 *  the list of sections that will be rendered.
 *
 *  @param ... List of keys to remove.
 */
HelpDocument.prototype.remove = function() {
  var ind, i, key;
  for(i = 0;i < arguments.length;i++) {
    key = arguments[i];
    ind = this.sections.indexOf(key);
    if(~ind) {
      this.sections.splice(ind, 1);
    }
  }
}

/**
 *  Indent lines by amount.
 *
 *  @param value The .
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.indent = function(value, amount, data, stream, doc) {
  amount = typeof amount !== 'number' ? INDENT : amount;
  var prefix = repeat(amount);
  var lines = value.split(/\n{1,1}/);
  lines.forEach(function(value, index, arr) {
    if(value) arr[index] = prefix + value;
  })
  return lines.join('\n');
}

HelpDocument.prototype.getOptionDelimiter = function(doc) {
  return this.delimiter;
}

/**
 *  Retrieve a string to use when listing options.
 */
HelpDocument.prototype.getOptionString = function(arg) {
  var delimiter = this.getOptionDelimiter();
  var extra = arg.extra ? arg.extra() || '' : '';
  if(extra) {
    extra = extra.replace(/^(.?)=(.*)$/, "$1$2");
    extra = this.assignment + extra;
  }
  return arg.toString(delimiter) + extra;
}

/**
 *  Determine whether a section should be printed.
 */
HelpDocument.prototype.hasSection = function(key) {
  if(process.env.CLI_TOOLKIT_HELP2MAN) return true;
  var conf = this.cli.configure();
  if(conf.help && conf.help.sections && conf.help.sections[key] === false) {
    return false;
  }
  return ~this.sections.indexOf(key);
}

/**
 *  Write a section title by key.
 *
 *  @param key The key for the section.
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.title = function(key, data, stream, doc) {
  var title = key;
  title = this.headers[key] || key;
  this.header(title, data, stream, doc);
}

/**
 *  Write a section header.
 *
 *  @param title The value for the section header.
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.header = function(title, data, stream, doc) {}

/**
 *  Utility to print to the target stream.
 *
 *  @param stream The target stream.
 *  @param format The message format.
 *  @param ... Message replacement parameters.
 */
HelpDocument.prototype.print = function(stream, format) {
  var conf = this.cli.configure();
  var vanilla = conf.help && conf.help.vanilla;
  var parameters = [].slice.call(arguments, 2);
  var method = (stream === process.stdout || stream === process.stderr)
    ? (stream === process.stdout) ? console.log : console.error : stream.write;
  var scope = (stream === process.stdout || stream === process.stderr)
    ? console : stream;
  var args = [];
  args = parameters;
  args.unshift(format || '');
  if(vanilla || scope === stream) {
    var msg = util.format.apply(util, args);
    if(scope === stream) msg += '\n';
    args = [msg];
  }
  method.apply(scope, args);
}

/**
 *  Create all metrics information.
 */
HelpDocument.prototype.getMetrics = function() {
  var keys = Object.keys(this.cli._commands);
  var metrics = this.getOptionMetrics(keys, this.cli._commands);
  metrics.keys = keys;
  this.metrics[HelpDocument.COMMANDS] = metrics;
  keys = Object.keys(this.cli._options);
  metrics = this.getOptionMetrics(keys, this.cli._options);
  this.metrics[HelpDocument.OPTIONS] = metrics;
  metrics.keys = keys;
  this.metrics.maximum = Math.max(
    this.metrics[HelpDocument.COMMANDS].width,
    this.metrics[HelpDocument.OPTIONS].width);
}

/**
 *  Retrieve options metrics information.
 *
 *  @param keys The array of option keys.
 *  @param target The target object, either commands or options.
 */
HelpDocument.prototype.getOptionMetrics = function(keys, target) {
  var delimiter = this.getOptionDelimiter();
  var max = 0;
  var metrics = {short: false, long: false, both: false, values: {}, width: 0};
  var i, j, key, arg, str, name, z;
  for(i = 0;i < keys.length;i++) {
    key = keys[i]
    arg = target[key];
    str = this.getOptionString(arg);
    metrics.width = Math.max(metrics.width, str.length);
    metrics.values[key] = str;
    var names = arg.names();
    for(j = 0;j < names.length;j++) {
      name = names[j];
      if(!metrics.short) metrics.short =
          name.length === 1 || /^-[^-]{1,1}$/.test(name);
      if(!metrics.long) metrics.long = /^--/.test(name);
      if(metrics.short && metrics.long) metrics.both = true;
    }
  }
  // if we have an option that contains a short
  // and long value (both) we search for options that are
  // only a long option and pad them to align with
  // the long option of the options that have both
  if(metrics.both && this.format === COLUMN_ALIGN) {
    for(z in metrics.values) {
      arg = target[z];
      //if(arg.names().length === 1 && /^--/.test(arg.names()[0])) {
      if(arg.names().length === 1) {
        metrics.values[z] =
          repeat(delimiter.length + 2) + metrics.values[z];
        metrics.width = Math.max(metrics.width, metrics.values[z].length);
      }
    }
  }
  return metrics;
}

/**
 *  Sort option keys.
 *
 *  @param keys The array of option keys.
 *  @param target The target object, either commands or options.
 *  @param metrics The options metrics information.
 */
HelpDocument.prototype.sort = function(keys, target, metrics) {
  var conf = this.cli.configure();
  if(conf.help.sort === null) return keys;
  var order = conf.help.sort;
  if(order === true || typeof order === 'function') {
    keys = typeof(order) == 'function'
      ? keys.sort(order) : keys.sort();
  }else{
    var both = metrics.both;
    if(both) {
      keys.sort(function(a, b) {
        var aa = target[a];
        var ab = target[b];
        if(order === 1) {
          return aa.names().join('').length < ab.names().join('').length;
        }else if(order === -1) {
          return aa.names().join('').length > ab.names().join('').length;
        }
        return aa.names().length < ab.names().length;
      })
    }
  }
}

/**
 *  Initialize section titles, creating defaults and overriding
 *  with titles specified in the help configuration.
 */
HelpDocument.prototype.titles = function() {
  var titles = this.cli.configure().help.titles || {}, i, key, title;
  for(i = 0;i < this.sections.length;i++) {
    key = this.sections[i];
    title = titles[key] || headers[key] || key;
    if(!titles[key]) {
      title = ucfirst(title) + ':';
    }
    this.headers[key] = title;
  }
}

/**
 *  Makes descriptions obey the pedantic option.
 *
 *  @param description The description.
 *
 *  @return The description, if pedantic is set then the description
 *  will be title case with a terminating period.
 */
HelpDocument.prototype.getDescription = function(description) {
  if(!this.conf.pedantic || !description) return description;
  description = '' + ucfirst(description);
  if(!/\.$/.test(description)) description += '.';
  return description;
}


/**
 *  Write the document to a stream.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.write = function(data, stream) {
  stream = stream || process.stdout;
  var i, method, result;
  for(i = 0;i < this.sections.length;i++) {
    method = this[this.sections[i]];
    result = method.call(this, data, stream);
    // was written to the stream
    if(result === true) continue;
    if(typeof result === 'string') {
      this.print(stream, result);
    }
  }
}

module.exports = {};
module.exports.HelpDocument = HelpDocument;
module.exports.sections = sections;
module.exports.align = align;
module.exports.COLUMN_ALIGN =
  HelpDocument.COLUMN_ALIGN = COLUMN_ALIGN;
module.exports.LINE_ALIGN =
  HelpDocument.LINE_ALIGN = LINE_ALIGN;
module.exports.FLEX_ALIGN =
  HelpDocument.FLEX_ALIGN = FLEX_ALIGN;
module.exports.WRAP_ALIGN =
  HelpDocument.WRAP_ALIGN = WRAP_ALIGN;
sections.forEach(function(key) {
  module.exports[key.toUpperCase()] = HelpDocument[key.toUpperCase()] = key;
});
