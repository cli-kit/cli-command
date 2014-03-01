var define = require('cli-define');
var Command = define.Command;
var environ = require('cli-env');

// TODO: move this to the define module?
function getOption(arg, long) {
  var names = arg.names(), i;
  if(arg instanceof Command) {
    var nm, name = '';
    for(i = 0;i < names.length;i++) {
      nm = names[i];
      if(nm.length > name.length) {
        name = nm;
      }
    }
    return name;
  }else{
    var re = long ? /^--/ : /^-[^-]/;
    for(i = 0;i < names.length;i++) {
      if(re.test(names[i])) {
        return names[i];
      }
    }
  }
  return arg.name();
}

function getListData(data, target, prefix, delimiter) {
  var z, arg, full, variants;
  var re = /^(version|help)opt$/;
  for(z in target) {
    arg = target[z];
    // the built in help and version options use an
    // opt suffix so as not to conflict with the help()
    // and version() methods, here we strip that so the
    // variable references are cleaner for those options
    if(re.test(z)) z = z.replace('opt', '');
    full = prefix + z + delimiter;
    data[full + 'name'] = arg.name();
    data[full + 'long'] = getOption(arg, true);
    data[full + 'short'] = getOption(arg);
    if(!(arg instanceof Command) && arg.extra()) {
      data[full + 'extra'] = arg.extra();
    }
    data[full + 'help'] = arg.getOptionString();
    data[full + 'pipe'] = arg.toString(null);
    data[full + 'comma'] = arg.toString(', ');
    if(define.re.no().test(arg.name())) {
      variants = define.getNoVariants(arg);
      data[full + 'yes'] = variants.yes;
      data[full + 'no'] = variants.no;
    }
  }
}

function getDescription(arg, data, escaped) {
  var description = arg.description();
  //console.dir(description);
  description.md = environ.replace(description.md, data, escaped);
  description.txt = environ.replace(description.txt, data, escaped);
}

function update(data, target, escaped) {
  var z;
  for(z in target) {
    getDescription(target[z], data, escaped);
  }
}

function object(data, target, escaped) {
  var z;
  for(z in target) {
    target[z] =
      environ.replace(target[z], data, escaped);
  }
}

function array(data, target, escaped) {
  for(var i = 0;i < target.length;i++) {
    if(typeof target[i] === 'string') {
      target[i] = environ.replace(target[i], data, escaped);
    }else if(Array.isArray(target[i])) {
      array(data, target[i], escaped);
    }else if(target[i] && typeof target[i] === 'object') {
      object(data, target[i], escaped);
    }
  }
}

function sections(data, target, escaped) {
  var z, k;
  for(z in target) {
    if(typeof target[z] === 'string') {
      target[z] = environ.replace(target[z], data, escaped);
    }else if(Array.isArray(target[z])) {
      array(data, target[z], escaped);
    }else if(target[z]
      && typeof target[z] === 'object') {
      console.dir(target[z]);
      object(data, target[z], escaped);
    }
  }
}

// post process the program
// with environment data
function substitute(data, escaped) {
  var conf = this.configure();
  var delimiter = '_';
  var prefixes = {
    opt: 'opt' + delimiter,
    cmd: 'cmd' + delimiter
  }
  // update data object
  getListData(data, this._options, prefixes.opt, delimiter);
  getListData(data, this._commands, prefixes.cmd, delimiter);

  // TODO: include this in a system trace output
  //console.dir(data);

  // substitute on name/description
  this.name(environ.replace(this.name(), data, escaped));
  getDescription(this, data, escaped);

  // update command and options
  update(data, this._options, escaped);
  update(data, this._commands, escaped);

  // update examples
  sections(data, conf.help.sections, escaped);
}

module.exports = substitute;
