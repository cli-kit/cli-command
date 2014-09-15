var eol = require('os').EOL;
var util = require('util');

var define = require('cli-define'),
  Command = define.Command
var utils = require('cli-util');
var manual = require('markzero').manual;
var pad = utils.pad, repeat = utils.repeat;
var ucfirst = utils.ucfirst, wrap = utils.wrap;
var pedantic = utils.pedantic;
var columns = require('./column');
var fmt = require('./formats');
var alias = require('../../util/alias');

var color = require('../../middleware/color');

var auto = require('./auto');
var sections = manual.layout;

var headers = {
  synopsis: 'usage',
  //arguments: 'arguments',
  see: 'see also'
};

/**
 *  Abstract super class for help documents.
 *
 *  @param program The program instance.
 */
var HelpDocument = function(program) {
  this.cli = program;
  this.cmd = this.cli;
  if(process.env.CLI_TOOLKIT_HELP_CMD) {
    var cmd = alias(process.env.CLI_TOOLKIT_HELP_CMD, this.cli.commands());
    if(cmd) this.cmd = cmd;
  }
  this.eol = eol;
  this.format = fmt.TEXT_FORMAT;
  this.help2man = !!process.env.help2man;
  this.conf = this.cli.configure().help;
  this.vanilla = this.conf.vanilla;
  if(this.colon === undefined) {
    this.colon = typeof this.conf.colon === 'boolean'
      ? this.conf.colon : true;
  }
  this.messages = this.conf.messages;
  this.limit = this.conf.maximum ? this.conf.maximum : 80;
  this.usage = this.cli.usage();
  this.delimiter = this.conf.delimiter ? this.conf.delimiter : ', ';
  this.assignment = this.conf.assignment ? this.conf.assignment : '=';
  this.align = this.conf.align || columns.COLUMN_ALIGN;
  this.collapse = this.conf.collapse;
  if(!~columns.align.indexOf(this.align)) {
    this.align = columns.COLUMN_ALIGN;
  }
  this.sections = sections.slice(0);

  // custom unknown sections in help conf
  if(this.conf.sections) {
    var ckeys = Object.keys(this.conf.sections), i, k;
    // custom sections come after options
    var ind = this.sections.indexOf(manual.OPTIONS) + 1;
    for(i = 0;i < ckeys.length;i++) {
      k = ckeys[i].toLowerCase();
      if(!~this.sections.indexOf(k)) {
        // inject into section list
        this.sections.splice(ind, 0, k);
        ind++;
      }
    }
  }

  this.padding = this.conf.indent;
  this.space = this.conf.space || repeat(this.padding);
  this.wraps = true;
  this.width = this.conf.width;
  // whether to use columns
  this.use = this.format === fmt.TEXT_FORMAT;
  this.headers = {};
  this.metrics = {};
  this.getMetrics();
  this.titles();
}

HelpDocument.prototype.isRootCommand = function() {
  return this.cmd === this.cli;
}

/**
 *  Write a custom unknown section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.custom = function(data, stream, key) {
  if(!this.useCustom) return false;
  //console.log('RENDER CUSTOM SECTION %s %s %j', key, this.isRootCommand(), this.cmd.sections);
  //console.dir(this.conf.sections[key]);
  //console.dir(this.conf);
  //if(this.isRootCommand()) {
    //console.log('testing root section on key %s (%j)', key, Object.keys(this.conf.sections));
  //}
  function find(key, target) {
    var re = new RegExp('^' + key, 'i'), k;
    for(k in target) {
      //console.dir(k);
      if(re.test(k) && target[k]) {
        return target[k].text || target[k];
      }
    }
    return '';
  }

  var text = find(key, this.isRootCommand() ? this.conf.sections : this.cmd.sections);
  //if(this.isRootCommand() && text) {
    //console.log('found root section on key %s', key);
  //}
  //
  if(!text) text = '';

  //console.log('RENDER CUSTOM SECTION %s', key);
  //console.log(this.conf.sections[key]);
  //console.log('END RENDER CUSTOM SECTION %s', key);
  return this.render(key, data, stream, text);
}

/**
 *  Write the name section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.name = function(data, stream) {
  return this.render(HelpDocument.NAME, data, stream);
}

/**
 *  Write the synopsis section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.synopsis = function(data, stream) {
  return this.render(HelpDocument.SYNOPSIS, data, stream);
}

/**
 *  Write the description section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.description = function(data, stream) {
  //console.log('render description section...');
  //data.sections = data.sections || {};
  if(!data.sections.description) {
    data.sections.description = this.getDescription(
      this.cmd.description(), this.cmd.detail());
  }
  //console.log(data.sections.description);
  //console.log(this.cmd.description());
  //console.log(this.cmd.detail());
  return this.render(HelpDocument.DESCRIPTION, data, stream);
}

/**
 *  Write the options section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.options = function(data, stream) {
  return this._options(data, stream);
}

/**
 *  Write argument options if any arguments are defined.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype._options = function(data, stream) {
  if(!this.hasOptions()) return false;
  this.title(HelpDocument.OPTIONS, data, stream);
  return this.opts(
    this.cmd._options, HelpDocument.OPTIONS, data, stream);
}

/**
 *  Write command options.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.commands = function(data, stream) {
  return this._commands(data, stream);
}

/**
 *  Write command options if any commands are defined.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype._commands = function(data, stream) {
  if(!this.hasCommands()) return false;
  this.title(HelpDocument.COMMANDS, data, stream);
  return this.opts(this.cmd._commands, HelpDocument.COMMANDS, data, stream);
}

/**
 *  Write a group of options.
 *
 *  @param target The object containing option definitions.
 *  @param key The key for the target, either commands or options.
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.opts = function(target, key, data, stream) {
  var arg, parts = [], i, left, right;
  var metrics = this.metrics[key];
  var keys = metrics.keys;
  this.sort(keys, target, metrics);
  for(i = 0;i < keys.length;i++) {
    arg = target[keys[i]];
    left = metrics.values[keys[i]];
    right = this.getDescription(arg.description());
    parts.push(
      this.use ? this.column(left, right) : {left: left, right: right});
  }
  this.printlines(parts, stream, key);
  return true;
}

/**
 *  Write the environment section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.environment = function(data, stream) {
  return this.render(HelpDocument.ENVIRONMENT, data, stream);
}

/**
 *  Write the files section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.files = function(data, stream) {

  //console.log('RENDER FILES');
  //console.log(this.conf.sections.files);
  //console.log('END RENDER FILES');

  return this.render(HelpDocument.FILES, data, stream);
}

/**
 *  Write the examples section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.examples = function(data, stream) {
  return this.render(HelpDocument.EXAMPLES, data, stream);
}

/**
 *  Write the exit status section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.exit = function(data, stream) {
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
  return this.render(HelpDocument.EXIT, data, stream, section);
}

/**
 *  Write the history section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.history = function(data, stream) {
  return this.render(HelpDocument.HISTORY, data, stream);
}

/**
 *  Write the author section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.author = function(data, stream) {
  return this.render(HelpDocument.AUTHOR, data, stream);
}

/**
 *  Write the bugs section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.bugs = function(data, stream) {
  var section = this.getDefaultBugs(data);
  return this.render(HelpDocument.BUGS, data, stream, section);
}

/**
 *  Write the copyright section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.copyright = function(data, stream) {
  var section = this.getDefaultCopyright(data);
  return this.render(HelpDocument.COPYRIGHT, data, stream, section);
}

/**
 *  Write the see also section.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 *  @param doc The help document.
 */
HelpDocument.prototype.see = function(data, stream) {
  return this.render(HelpDocument.SEE, data, stream);
}

/* UTILITY */

HelpDocument.prototype.getDefaultCopyright = function(data) {
  if(data.copyright && !data.sections.copyright) {
    data.sections.copyright = data.copyright;
  }
  return data.sections.copyright;
}

HelpDocument.prototype.getDefaultBugs = function(data) {
  if(data.bugs && !data.sections.bugs) {
    data.sections.bugs = util.format(
      this.messages.bugs, (data.bugs.email || data.bugs.url));
  }
  return data.sections.bugs;
}

HelpDocument.prototype.render = function(key, data, stream, section) {
  //console.log('render %s %s', key, typeof section);
  if(!this.hasSection(key)) return false;
  if(!section) {
    section = this.getSection(data, key);
  }
  if(section) {
    if(typeof section === 'object' && section.md) {
      if(this.format === fmt.TEXT_FORMAT) {
        section = '' + section;
      }else{
        section = section.md;
      }
    }
    this.title(key, data, stream);
    if(Array.isArray(section)) {
      this.printsection(section, stream, key);
      return true;
    }else if(typeof section === 'string') {
      if(!this.use) return section;
      return this.indent(section, null, data, stream, key);
    }
  }
}

/**
 *  Align two string values to columns.
 *
 *  @param left The value for the left column.
 *  @param right The value for the right column.
 */
HelpDocument.prototype.column = function(left, right) {
  return columns.call(this, left, right);
}

/**
 *  Retrieve a user-defined section.
 *
 *  @param data The help data object.
 */
HelpDocument.prototype.getSection = function(data, key) {
  if(key === HelpDocument.DESCRIPTION) {
    var description = this.cmd.description();
    var detail = this.cmd.detail();
    if(this.format === fmt.MAN_FORMAT) {
      // man format includes the short description in
      // the name section so we only use the detail in this
      // instance
      if(description && detail) {
        return this.getDescription(detail);
      }
    }else if(!this.isProgram()) {
      return this.getDescription(description, detail);
    }
  }else if(!this.isProgram() && key !== HelpDocument.SYNOPSIS) {
    return this.cmd.sections && this.cmd.sections[key] ?
      this.cmd.sections[key] : null;
  }

  // custom section configuration
  if(this.conf && this.conf.sections
    && this.conf.sections[key]) {
    return this.conf.sections[key];
  }
  return data.sections && data.sections[key] ?
    data.sections[key] : null;
}

/**
 *  Print a section defined as an array.
 */
HelpDocument.prototype.printsection = function(section, stream, key) {
  var i, left, right;
  var parts = [];
  for(i = 0;i < section.length;i++) {
    left = section[i].name || '';
    right = this.getDescription(section[i].description || '');
    if(!left) continue;
    parts.push(this.use ? this.column(left, right) : {left: left, right: right});
  }
  this.printlines(parts, stream, key);
}

HelpDocument.prototype.printlines = function(parts, stream, key) {
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
 */
HelpDocument.prototype.indent = function(value, amount, data, stream) {
  amount = typeof amount !== 'number' ? 0 : amount;
  var prefix = repeat(amount);
  var lines = value.split(/\n{1,1}/);
  lines.forEach(function(value, index, arr) {
    if(value) arr[index] = prefix + value;
  })
  return lines.join('\n');
}

/**
 *  Determine whether a section should be printed.
 */
HelpDocument.prototype.hasSection = function(key) {
  //if(process.env.CLI_TOOLKIT_HELP2MAN) return true;
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
 */
HelpDocument.prototype.title = function(key, data, stream) {
  var title = key;
  title = this.headers[key];
  if(title === false) return;
  title = title || key;
  this.header(title, data, stream);
}

/**
 *  Write a section header.
 *
 *  @param title The value for the section header.
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.header = function(title, data, stream) {
  if(title) {
    var section = this.hasCommands() && this.summarize()
      && title === this.headers[HelpDocument.OPTIONS];
    // right align headers in flex mode
    if(this.format === fmt.TEXT_FORMAT
       && this.align === columns.FLEX_ALIGN && !section) {
      var rcol = this.metrics.maximum + this.padding;
      title = pad(title, rcol, true);
    }

    this.print(stream, title);
  }
}


/**
 *  Utility to print to the target stream.
 *
 *  @param stream The target stream.
 *  @param format The message format.
 *  @param ... Message replacement parameters.
 */
HelpDocument.prototype.print = function(stream, format) {
  var conf = this.cli.configure();
  var parameters = [].slice.call(arguments, 2);
  var method = (stream === process.stdout || stream === process.stderr)
    ? (stream === process.stdout) ? console.log : console.error : stream.write;
  var scope = (stream === process.stdout || stream === process.stderr)
    ? console : stream;
  var args = [];
  args = parameters;
  args.unshift(format || '');
  if(this.vanilla || scope === stream) {
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
  var keys = Object.keys(this.cmd._commands);
  var metrics = this.getOptionMetrics(keys, this.cmd._commands);
  metrics.keys = keys;
  this.metrics[HelpDocument.COMMANDS] = metrics;
  keys = Object.keys(this.cmd._options);
  metrics = this.getOptionMetrics(keys, this.cmd._options);
  this.metrics[HelpDocument.OPTIONS] = metrics;
  metrics.keys = keys;
  this.metrics.maximum = Math.max(
    this.metrics[HelpDocument.COMMANDS].width,
    this.metrics[HelpDocument.OPTIONS].width);
}

/**
 *  Determine if the current command has commands.
 *
 *  @return Whether the current command has commands.
 */
HelpDocument.prototype.hasCommands = function() {
  return Object.keys(this.cmd._commands).length > 0;
}

/**
 *  Determine if the current command has options.
 *
 *  @return Whether the current command has options.
 */
HelpDocument.prototype.hasOptions = function() {
  return Object.keys(this.cmd._options).length > 0;
}

/**
 *  Determine if we are executing in the scope of the program.
 *
 *  @return Whether the help scope is the program or a command.
 */
HelpDocument.prototype.isProgram = function() {
  return this.cli === this.cmd;
}


/**
 *  Determine if the program commands should be preceeded by
 *  a summary.
 *
 *  @return Whether the program has a command summary.
 */
HelpDocument.prototype.summarize = function() {
  return !!this.messages.summary;
}

/**
 *  Retrieve options metrics information.
 *
 *  @param keys The array of option keys.
 *  @param target The target object, either commands or options.
 */
HelpDocument.prototype.getOptionMetrics = function(keys, target) {
  var max = 0;
  var metrics = {
    short: false, long: false, both: false, values: {}, width: 0};
  var i, j, key, arg, str, name, z;
  for(i = 0;i < keys.length;i++) {
    key = keys[i]
    arg = target[key];
    str = arg.getOptionString(
      this.delimiter, this.assignment, null, !(arg instanceof Command));
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
  if(metrics.both && this.align === columns.COLUMN_ALIGN) {
    for(z in metrics.values) {
      arg = target[z];
      //if(arg.names().length === 1 && /^--/.test(arg.names()[0])) {
      if(arg.names().length === 1) {
        metrics.values[z] =
          repeat(this.delimiter.length + 2) + metrics.values[z];
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

HelpDocument.prototype.getHeaderMap = function() {
  return headers;
}

/**
 *  Initialize section titles, creating defaults and overriding
 *  with titles specified in the help configuration.
 */
HelpDocument.prototype.titles = function() {
  var titles = this.cli.configure().help.titles || {}, i, key, title;
  var sections = this.sections.slice(0);
  var headers = this.getHeaderMap();
  sections = sections.concat(Object.keys(headers));
  for(i = 0;i < sections.length;i++) {
    key = sections[i];
    //console.log('write title %s', key);
    title = titles[key] || headers[key] || key;
    if(!titles[key]) {
      title = ucfirst(title);
      if(this.colon) title += ':';
    }
    this.headers[key] = title;
  }
}

/**
 *  Makes descriptions obey the pedantic option.
 *
 *  @param description The short description.
 *  @param detail The detailed description.
 *
 *  @return The description, if pedantic is set then the description
 *  will be title case with a terminating period.
 */
HelpDocument.prototype.getDescription = function(description, detail) {
  if(!description) return description;
  description = define.toDescription(description);
  if(typeof description == 'object'
    && description.md
    && (this.format === fmt.MARKDOWN_FORMAT
    || this.format === fmt.MAN_FORMAT)) {
    description = description.md;
    if(detail && detail.md) {
      description += eol + eol + detail.md;
    }
  }
  if(this.conf.pedantic) {
    description = '' + ucfirst('' + description);
    description = pedantic(description);
    description = description.replace(/:$/, '.');
  }
  return description;
}

/**
 *  Get an array of synopsis components.
 *
 *  @return The synopsis.
 */
HelpDocument.prototype.getSynopsis = function(wrapped, name, prefix, nopad) {
  prefix = prefix || '';
  return auto.call(this, wrapped, name, prefix, nopad);
}

/**
 *  Write the document to a stream.
 *
 *  @param data The program data.
 *  @param stream The output stream.
 */
HelpDocument.prototype.write = function(data, stream) {
  stream = stream || process.stdout;
  var i, k, method, args, result;
  // disable the ttycolor error stream redirect
  // for help output
  if(color.use) {
    require('ttycolor').stderr(false);
  }
  //console.log('write with sections %j', this.sections);
  var methodList = {};

  data.sections = data.sections || {};
  for(i = 0;i < this.sections.length;i++) {
    //console.log('write %s', this.sections[i]);
    k = this.sections[i];
    method = typeof this[k] === 'function'
      && ~sections.indexOf(k) ? this[k] : null;
    args = [data, stream, k];

    // known section on a non-root command
    if(this[k] && !this.isRootCommand()
       && this.cmd.sections && this.cmd.sections[k]) {
      method = this.custom;
    }

    if(!method) {
      method = this.custom;
    }

    if(!method) continue;
    //console.log('custom %s', this.custom);
    //console.log('got method...%s', method);
    //console.dir(method);
    result = method.apply(this, args);
    if(typeof result === 'string') {
      this.print(stream, result);
    }
    if(result === null) break;
    // print newlines between sections
    if(result && !this.collapse && (i < this.sections.length - 1)) {
      //console.log('write newline %s %s', i, this.sections.length);
      this.print(stream);
    }
  }
}

HelpDocument.prototype.toColumns = columns;

module.exports = {};
module.exports.HelpDocument = HelpDocument;
module.exports.sections = sections;
module.exports.columns = columns;
module.exports.headers = headers;
sections.forEach(function(key) {
  module.exports[key.toUpperCase()] = HelpDocument[key.toUpperCase()] = key;
});
//HelpDocument.ARGUMENTS = headers['arguments'];
