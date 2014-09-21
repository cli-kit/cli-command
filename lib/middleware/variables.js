var convert = require('cli-native');

/**
 *  Variables are command line arguments not defined by the program
 *  but specified using a prefix.
 *
 *  This allows a program to collect user-specific arguments into an object
 *  and optionally convert the variable values to native data types.
 *
 *  Variable arguments declared in this manner must use the assignment operator
 *  (=) to delimit the argument value.
 *
 *  For example a configuration such as {prefix: '@'} allows for user variable
 *  arguments such as:
 *
 *  @var=value
 */
module.exports = function() {
  var conf = this.configure();
  if(!conf.variables || (conf.variables && !conf.variables.prefix)) return this;
  return function variables(req, next) {
    var vars = {}, k, v
      , keys = req.result.vars.variables || {};
    for(k in keys) {
      v = keys[k];
      v = conf.variables.coerce
        ? convert.to(v, conf.variables.delimiter, conf.variables.json) : v;
      vars[k] = v;
    }
    req.vars = vars;
    next();
  }
}
