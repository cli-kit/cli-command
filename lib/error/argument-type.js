var util = require('util');
var CliError = require('cli-error').CliError;

/**
 *  An error subclass used to indicate that a supplied
 *  argument type is invalid.
 *
 *  @param message The error message.
 *  @param parameters Message replacement parameters.
 *  @param code A status exit code for the error.
 */
function ArgumentTypeError(message, parameters, code) {
  CliError.call(this, message, code, parameters);
}

util.inherits(ArgumentTypeError, CliError);

module.exports = ArgumentTypeError;
