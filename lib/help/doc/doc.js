var util = require('util');

var utils = require('cli-util');
var pad = utils.pad, repeat = utils.repeat, wrap = utils.wrap;

var INDENT = 2;
var COLUMN = 20;

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
  arguments: 'arguments'
};

/**
 *  Abstract super class for help documents.
 *
 *  @param program The program instance.
 */
var HelpDocument = function(program) {
  this.cli = program;
  this.conf = this.cli.configure().help;
  this.messages = this.conf.messages;
  this.limit = this.conf.column ? this.conf.column : 80;
  this.usage = this.cli.usage();
  this.sections = sections.slice(0);
  this.padding = INDENT;
  this.column = COLUMN;
  this.headers = {};
  this.titles();
}

// TODO: move to cli-util module
function ucfirst(val) {
  if(!val) return val;
  return val.charAt(0).toUpperCase() + val.slice(1);
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
  // TODO : rename this method
  this.args(data, stream);
}

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
 *  Align two string values.
 *
 *  @param options.left The value for the left column.
 *  @param options.right The value for the right column.
 *  @param options.indent The number of spaces for lead indentation.
 *  @param options.width The maximum length of the left column.
 *  @param options.wrap Whether to wrap the right column.
 *  @param options.column The target width of the left column.
 *  @param options.space Whitespace used to delimit columns.
 *  @param metrics Return metrics information.
 */
HelpDocument.prototype.align = function(options, metrics) {
  var left = options.left,
    right = options.right,
    indent = options.indent || this.padding,
    width = options.width,
    wrapr = options.wrap,
    column = options.column || this.column,
    space = options.space || '';
  column -= indent;
  var conf = this.cli.configure();
  var col = this.limit;
  var lead = repeat(indent);
  if(right && wrapr) {
    right = wrap(right, 0, col - column);
    var lines = right.split('\n');
    if(lines.length > 1) {
      var remainder = lines.slice(1).map(function(line) {
        return repeat(column + indent) + line;
      })
      right = lines[0] + '\n' + remainder.join('\n');
    }
  }
  padding = column;
  if(right && left.length >= column) {
    right = '\n' + lead + repeat(column) + right;
  }
  left = pad(left, padding)
  if(metrics) {
    return {
      lead: lead,
      left: left,
      right: right,
      space: space
    }
  }
  return lead + left + space + right;
}

/**
 *  Write the examples section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.examples = function(data, stream) {
  var enabled = this.hasSection(HelpDocument.EXAMPLES);
  if(!enabled) return false;
  var section = data.sections && data.sections.examples ?
    data.sections.examples : null;
  if(section) {
    this.title(HelpDocument.EXAMPLES, data, stream);
    if(Array.isArray(section)) {
      var elements = section.map(function(value) {
        return value.cmd;
      })
      var opts = {
        left: null,
        right: null,
        indent: null,
        width: 0,
        wrap: true
      };
      var parts = [];
      for(var i = 0;i < section.length;i++) {
        opts.left = section[i].name || '';
        opts.right = section[i].description || '';
        if(!opts.left) continue;
        parts.push(this.align(opts, true));
      }
      this.printlines(parts, stream);
      return true;
    }else if(typeof section === 'string') {
      return this.indent(section, null, data, stream);
    }
  }
}

HelpDocument.prototype.printlines = function(parts, stream) {
  var i, part;
  for(i = 0;i < parts.length;i++) {
    part = parts[i];
    this.print(stream, part.lead + '%s' + part.space + part.right, part.left);
  }
}

/**
 *  Write the exit status section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.exit = function(data, stream) {}

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
  var conf = this.cli.configure();
  var delimiter = conf.help && conf.help.delimiter ?
    conf.help.delimiter : ', ';
  return delimiter;
}

/**
 *  Retrieve a string to use when listing options.
 */
HelpDocument.prototype.getOptionString = function(arg) {
  var conf = this.cli.configure();
  var delimiter = this.getOptionDelimiter();
  var assignment = conf.help && conf.help.assignment ?
    conf.help.assignment : '=';
  var extra = arg.extra ? arg.extra() || '' : '';
  if(extra) {
    extra = extra.replace(/^(.?)=(.*)$/, "$1$2");
    extra = assignment + extra;
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
  return this.opts(this.cli._commands, data, stream, doc);
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
  return this.opts(this.cli._options, data, stream);
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
  if(metrics.both) {
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
sections.forEach(function(key) {
  module.exports[key.toUpperCase()] = HelpDocument[key.toUpperCase()] = key;
});
