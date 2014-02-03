var path = require('path');
var pkg = require(path.join(__dirname, '..', 'package.json'));
var repeat = require('cli-util').repeat;

/**
 *  Scream on property name conflict.
 *
 *  @param k The name of the conflicting property.
 *  @param arg The argument definition.
 */
function scream(k, arg) {
  var pad = repeat();
  var delimiter = repeat(80, '+');
  console.error(delimiter);
  console.error(
    pad + this.name + ': conflict detected on %s', arg.name);
  console.error();
  console.error(
    pad + 'property name %s would overwrite a %s',
    k, typeof(this[k]));
  console.error();
  var msg = pad + 'this will likely not be a problem, however, it ';
  msg += 'could be a headache for you\n';
  msg += pad
    + 'trying to access the api, therefore this operation is not permitted.\n';
  console.error(msg);
  msg = pad + 'you can remedy this in one of two ways:\n';
  console.error(msg);
  msg = pad + pad + 'a) rename the option so that it does not conflict';
  console.error(msg);
  console.error(pad + pad + 'b) set the %s configuration property\n', 'stash');
  console.error(pad + 'sorry for the bother, see the docs for more info: ');
  console.error();
  console.error(pad + '%s', pkg.repository.url);
  console.error();
  console.error(pad + '%s', pkg.author);
  console.error();
  console.error(delimiter);
  process.exit(this.errors.ECONFLICT.code);
}

/**
 *  Verify whether declared arguments would conflict with
 *  program property names.
 *
 *  @param actions Array of builtin actions to ignore.
 */
function check(actions) {
  var config = this.configuration() || {};
  if((typeof(config.stash) == 'string') && config.stash.length) return;
  var k, arg;
  for(k in this._arguments) {
    if(~actions.indexOf(k)) continue;
    arg = this._arguments[k];
    if(this.hasOwnProperty(k) || typeof(this[k]) == 'function') {
      return scream.call(this, k, arg);
    }
  }
}

module.exports = check;
module.scream = scream;
