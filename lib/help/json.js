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
  var pkg = this.package();
  var o = {};
  o.name = this.name();
  o.version = this.version();
  o.description = this.description();
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
  return JSON.stringify(o, func, indent !== null ? indent : 2);
}

module.exports.json = json;
module.exports.stringify = stringify;
