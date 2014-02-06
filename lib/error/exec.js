var util = require('util');
var CliError = require('cli-error').CliError;

/**
 *  An error subclass used to indicate that execution of
 *  a child process failed.
 *
 *  @param message The error message.
 *  @param parameters Message replacement parameters.
 *  @param code A status exit code for the error.
 */
function ExecError(message, parameters, code) {
  CliError.call(this, message, code, parameters);
}

util.inherits(ExecError, CliError);

module.exports = ExecError;
