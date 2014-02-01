var util = require('util');

/**
 *  Type functions are invoked in the scope of the program
 *  instance.
 *
 *  All type functions have the same signature.
 *
 *  They should return the new value to be assigned to
 *  the argument value or throw an ArgumentTypeError to indicate
 *  that the supplied value is invalid.
 */

/**
 *  An error subclass used to indicate that a supplied
 *  argument type is invalid.
 *
 *  @param message The error message.
 *  @param parameters Message replacement parameters.
 */
function ArgumentTypeError(message, parameters) {
  Error.call(this);
  this.message = message;
  this.parameters = parameters;
  Error.captureStackTrace(this);
  var stack = this.stack.split('\n');
  // NOTE: remove constructor from stack trace
  stack.splice(1, 1);
  this.stack = stack.join('\n');
}

util.inherits(ArgumentTypeError, Error);

/**
 *  Convert an arguments value to an integer.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 */
function integer(value, arg, index) {
  var msg = 'integer expected for %s, got %s';
  var parameters = [arg.names.join(' | '), value];
  if(Array.isArray(value)) {
    value.forEach(function(v, i, a) {
      parameters[parameters.length - 1] = v;
      v = parseInt(v);
      if(isNaN(v)) {
        throw new ArgumentTypeError(msg, parameters)
      }
      a[i] = v;
    });
    return value;
  }else{
    value = parseInt(value);
  }
  if(isNaN(value)) throw new ArgumentTypeError(msg, parameters);
  return value;
}

module.exports.ArgumentTypeError = ArgumentTypeError;
module.exports.integer = integer;
