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
    if(!arguments.length) return;
    var prefix = conf.variables.prefix;
    // check for invalid variable declarations
    var unparsed = req.result.unparsed, options = req.result.options;
    for(i = 0;i < unparsed.length;i++) {
      if(unparsed[i].indexOf(prefix) === 0) {
        return next(this.errors.EVARIABLE_DECLARATION, [unparsed[i]]);
      }
    }
    var vars = {};
    // gather legitimate variable declarations
    var keys = Object.keys(options), k, v;
    for(i = 0;i < keys.length;i++) {
      k = keys[i];
      v = options[k];
      if(k.indexOf(prefix) === 0) {
        k = k.substr(prefix.length);
        vars[k] = conf.variables.coerce
          ? convert.to(v, conf.variables.delimiter, conf.variables.json) : v;
      }
    }
    req.vars = vars;
    next();
  }
}
