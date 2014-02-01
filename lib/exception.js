/**
 *  Print error messages.
 *
 *  @param msg The error message.
 *  @param replacements Message parameter replacments.
 *  @param method An optional method used to write to stderr.
 */
function print(msg, replacements, method) {
  var params, method = method || console.error;
  if(Array.isArray(msg)) {
    msg.forEach(function(msg, index, arr) {
      params = replacements[index];
      params.unshift(msg);
      method.apply(null, params);
    });
  }else{
    replacements.unshift(msg);
    method.apply(null, replacements);
  }
}

/**
 *  Default error handler.
 *
 *  @param code The error code.
 *  @param codes Map of error codes.
 *  @param message An error message.
 *  @param parameters Array of information.
 */
module.exports = function(code, codes, message, parameters) {
  parameters = parameters || [];
  var msg = message || null;
  var replacements = [];
  var prefix = this._name + ': ';
  //console.log('raise error %s', message);
  switch(code) {
    case codes.EUNCAUGHT:
      var stack = parameters[0].stack.split('\n');
      stack.shift();
      msg = [prefix + '%s', stack.join('\n')];
      replacements = [[parameters[0].message], []];
      break;
    case codes.ENOENT:
      msg = prefix + '%s(1) does not exist, try --help';
      replacements = [parameters[0]];
      break;
    case codes.EPERM:
      msg = prefix + '%s(1) not executable, try chmod or run with root';
      replacements = [parameters[0]];
      break;
    case codes.EREQUIRED:
      msg = prefix + 'missing required option %s';
      replacements = [parameters[0].names.join(' | ')];
      break;
    case codes.EMULTIPLE:
      msg = prefix + 'option %s may only be specified once, got %s';
      replacements = [parameters[0].names.join(' | '),
        parameters[1].join(', ')];
      break;
    case codes.ETYPE:
      replacements = parameters;
      break;
  }
  this.emit('exception', code, codes, parameters);
  var exit = true;
  if(this._error) {
    exit = this._error.call(this, code, codes, msg, replacements, parameters);
  }else if(msg){
    print.call(this, msg, replacements);
  }
  if(exit) process.exit(code);
}

module.exports.print = print;
