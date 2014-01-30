/**
 *  Default error handler.
 *
 *  @param code The error code.
 *  @param codes Map of error codes.
 *  @param parameters Array of information.
 */
module.exports = function(code, codes, parameters) {
  parameters = parameters || [];
  switch(code) {
    case codes.EUNCAUGHT:
      var stack = parameters[0].stack.split('\n');
      stack.shift();
      console.error(this._name + ': %s', parameters[0].message);
      console.error(stack.join('\n'));
      break;
    case codes.ENOENT:
      console.error('%s(1) does not exist, try --help', parameters[0]);
      break;
    case codes.EPERM:
      console.error('%s(1) not executable, try chmod or run with root',
        parameters[0]);
      break;
  }
  process.exit(code);
}
