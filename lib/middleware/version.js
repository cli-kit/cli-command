var cli = require('cli-define');
var Flag = cli.Flag;

/**
 *  Default program version action.
 *
 *  @param alive Do not exit the process.
 *  @param ... Message replacement parameters.
 */
function handler(req, next) {
  var config = this.configuration();
  var opts = [this._version];
  if(arguments.length > 1 && typeof(next) !== 'function') {
    opts = opts.concat([].slice.call(arguments, 1));
  }
  opts.unshift(this._name + ' %s');
  console.log.apply(console, opts);
  if(config.exit && req !== true) process.exit();
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
  if(!arguments.length && this._arguments.version) return this._version;
  if(typeof semver == 'function') {
    action = semver;
    semver = null;
  }
  action = action || handler;
  if(semver) this._version = semver;
  name = name || '-V --version';
  //console.log('action %s', action);
  var flag = new Flag(
    name, description || 'print the program version', {action: action});
  flag.key('version');
  this.flag(flag);
  return this;
}

module.exports.action = handler;
