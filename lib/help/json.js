var fields = [
  'author',
  'bugs',
  'contributors',
  'homepage',
  'keywords',
  'license',
  'licenses',
  'repository'
]

function common(arg, o) {
  o.name = arg.name();
  o.description = arg.description();
  o.detail = arg.detail();
  o.names = arg.names();
}

function opt(opts, o) {
  var z, arg;
  for(z in opts) {
    arg = opts[z];
    o[z] = {};
    common(arg, o[z]);
    if(arg.extra()) o[z].extra = arg.extra();
  }
}

function cmd(cmds, o) {
  var z, arg;
  for(z in cmds) {
    arg = cmds[z];
    o[z] = {};
    o[z].id = arg.getFullName();
    o[z].long = arg.getLongName();
    common(arg, o[z]);
    // recurse nested commands/options
    command(arg, o[z]);
  }
}

function command(target, o) {
  var cmds = Object.keys(target._commands);
  var opts = Object.keys(target._options);
  if(cmds.length) {
    o.commands = {};
    cmd(target._commands, o.commands);
  }
  if(opts.length) {
    o.options = {};
    opt(target._options, o.options);
  }
}

function json() {
  var conf = this.configure();
  var pkg = this.package();
  var copyright = conf.copyright || (pkg ? pkg.copyright : null);
  var o = {};
  o.name = this.name();
  o.version = this.version();
  o.description = this.description();
  o.detail = this.detail();
  if(copyright) o.copyright = copyright;
  if(this.errors) o.errors = this.errors;
  if(conf.help && conf.help.sections) o.sections = conf.help.sections;
  if(pkg) {
    fields.forEach(function(z) {
      if(pkg[z]) o[z] = pkg[z];
    });
  }
  command(this, o);
  return o;
}

json.fields = fields;

function stringify(indent, func) {
  var o = json.call(this);
  indent = typeof indent === 'number' ? indent : this.configure().help.indent;
  return JSON.stringify(o, func, indent);
}

module.exports.json = json;
module.exports.stringify = stringify;
