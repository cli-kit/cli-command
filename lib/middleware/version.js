var util = require('util');
var cli = require('cli-define');
var Flag = cli.Flag;

var wrap = require('cli-util').wrap;

/**
 *  Default program version action.
 *
 *  @param alive Do not exit the process.
 *  @param ... Message replacement parameters.
 */
function handler(req, next) {
  var conf = this.configure();
  var pkg = this.package();
  var copyright = conf.copyright || (pkg ? pkg.copyright : null);
  var opts = [this._version];
  var msg = this._name + ' %s';

  // NOTE: allows deferring to this handler from a custom handler
  if(arguments.length > 1 && typeof(next) !== 'function') {
    opts = opts.concat([].slice.call(arguments, 1));
  }
  opts.unshift(msg);
  // respect vanilla help setting
  if(conf.help.vanilla) {
    opts = [util.format.apply(util, opts)];
  }
  console.log.apply(console, opts);
  if(copyright) {
    console.log();
    copyright = '' + copyright;
    copyright = wrap(copyright, 0, conf.help.maximum);
    console.log(copyright);
  }
  if(conf.exit && req !== true) process.exit();
  return false;
}

/**
 *  Adds a version flag to the program.
 *
 *  @param semver A specific version number.
 *  @param name The argument name.
 *  @param description The argument description.
 *  @param action A function to invoke.
 */
module.exports = function(semver, name, description, action) {
  if(typeof semver == 'function') {
    action = semver;
    semver = null;
  }
  action = action || handler;
  if(semver) this._version = semver;
  name = name || '--version';
  var flag = new Flag(
    name,
    description || 'output version information and exit', {action: action});
  flag.key('versionopt');
  //flag.value(undefined);
  this.flag(flag);
  return this;
}

module.exports.action = handler;
