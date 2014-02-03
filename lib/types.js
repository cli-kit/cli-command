var pth = require('path');
var uri = require('url');
var util = require('util');
var utils = require('cli-util');

var ArgumentTypeError = require('./error/argument-type');

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
 *  Convert an argument's value to a string.
 *
 *  Strictly speaking this is a noop but is declared
 *  so that the String class constructor can be mapped.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A string.
 */
function string(value, arg, index) {
  if(!arguments.length) return;
  return value;
}

/**
 *  Convert an argument's value to an array.
 *
 *  Strictly speaking this is a noop as arguments
 *  declared as repeatable are always coerced to
 *  arrays, however, this is declared so that the
 *  Array constructor may be used.
 *
 *  It could be useful for non-repeatable options
 *  that you wish to convert to arrays with a single
 *  entry.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return An array.
 */
function array(value, arg, index) {
  if(!arguments.length) return;
  return Array.isArray(value) ? value : [value];
}


/**
 *  Parse an argument's value as JSON.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A parsed object or throws an error if the JSON
 *  is malformed.
 */
function json(value, arg, index) {
  if(!arguments.length) return;
  var msg = 'invalid json for %s, got %s';
  var parameters = [arg.names.join(' | '), value];
  try {
    value = JSON.parse(value);
  }catch(e) {
    err = new ArgumentTypeError(msg, parameters);
    err.source = e;
    throw err;
  }
  return value;
}

/**
 *  Convert an argument's value to an integer, float or number.
 *
 *  @param func The number coercion function to invoke.
 *  @param prefix The error message prefix.
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A number or throws an error if the result is NaN.
 */
function num(func, prefix, value, arg, index) {
  var msg = prefix + ' expected for %s, got %s';
  var parameters = [arg.names.join(' | '), value];
  function parse(value) {
    value = func(value);
    if(isNaN(value)) throw new ArgumentTypeError(msg, parameters);
    return value;
  }
  if(Array.isArray(value)) {
    value.forEach(function(v, i, a) {
      parameters[parameters.length - 1] = v;
      a[i] = parse(v);
    });
    return value;
  }
  return parse(value);
}

/**
 *  Convert an argument's value to an integer.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return An integer or throws an error if the result is NaN.
 */
function integer(value, arg, index) {
  if(!arguments.length) return;
  return num.call(this, parseInt, 'integer', value, arg, index);
}

/**
 *  Convert an argument's value to an float.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A float or throws an error if the result is NaN.
 */
function float(value, arg, index) {
  if(!arguments.length) return;
  return num.call(this, parseFloat, 'float', value, arg, index);
}

/**
 *  Convert an argument's value to an number.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A number or throws an error if the result is NaN.
 */
function number(value, arg, index) {
  if(!arguments.length) return;
  return num.call(this, Number, 'number', value, arg, index);
}

/**
 *  Convert an argument's value to a date.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A date or throws an error if the string
 *  could not be parsed as a date.
 */
function date(value, arg, index) {
  if(!arguments.length) return;
  var msg = 'invalid date for %s, got %s';
  var parameters = [arg.names.join(' | '), value];
  function parse(value) {
    var u = Date.parse(value);
    if(isNaN(u)) throw new ArgumentTypeError(msg, parameters);
    return new Date(value);
  }
  if(Array.isArray(value)) {
    value.forEach(function(v, i, a) {
      parameters[parameters.length - 1] = v;
      a[i] = parse(v);
    });
    return value;
  }
  return parse(value);
}

/**
 *  Convert an argument's value to a boolean.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A boolean.
 */
function boolean(value, arg, index) {
  if(!arguments.length) return;
  function parse(value) {
    if(/^true$/i.test(value)) return true;
    if(/^false$/i.test(value)) return false;
    if(!isNaN(parseInt(value))) value = parseInt(value);
    return Boolean(value);
  }
  if(Array.isArray(value)) {
    value.forEach(function(v, i, a) {
      a[i] = parse(v);
    });
    return value;
  }
  return parse(value);
}

/**
 *  Convert an argument's value to a path.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A resolved file system path or the original value
 *  if the path could not be resolved.
 */
function path(value, arg, index) {
  if(!arguments.length) return;
  function parse(value) {
    if(/^\//.test(value)) return value;
    if(/^~\//.test(value)) {
      var user = utils.home();
      if(user) return pth.resolve(user, value.replace(/^~\//, ''));
    }
    return pth.resolve(process.cwd(), value);
  }
  if(Array.isArray(value)) {
    value.forEach(function(v, i, a) {
      a[i] = parse(v);
    });
    return value;
  }
  return parse(value);
}

/**
 *  Convert an argument's value to a URL.
 *
 *  @param value The command line value.
 *  @param arg The argument definition.
 *  @param index An index into an array (multiple only).
 *
 *  @return A URL or throws an error if the URL does not contain
 *  a host.
 */
function url(value, arg, index) {
  if(!arguments.length) return;
  var msg = 'invalid url for %s, got %s';
  var parameters = [arg.names.join(' | '), '' + value];
  function parse(value) {
    value = uri.parse(String(value), true, true);
    if (!value.host) throw new ArgumentTypeError(msg, parameters);
    return value;
  }
  if(Array.isArray(value)) {
    value.forEach(function(v, i, a) {
      parameters[parameters.length - 1] = v;
      a[i] = parse(v);
    });
    return value;
  }
  return parse(value);
}

/**
 *  Convert an argument's value to an array based
 *  upon a string or regex delimiter.
 *
 *  @param delimiter The delimiter to split the value on.
 *
 *  @return A converter closure.
 */
function list(delimiter) {
  return function(value, arg, index) {
    return value.split(delimiter);
  }
}

/**
 *  Ensures that a value is one of a specified list
 *  of string values.
 *
 *  Throws an error if the value is not contained
 *  in the enum list.
 *
 *  @param list An array of allowed values.
 *
 *  @return A converter closure.
 */
function enumerable(list) {
  if(!Array.isArray(list)) list = [list];
  return function(value, arg, index) {
    var msg = 'invalid value for %s, expected %s got %s';
    var parameters = [arg.names.join(' | '), list.join(', '), '' + value];
    if(!~list.indexOf(value)) {
      throw new ArgumentTypeError(msg, parameters);
    }
    return value;
  }
}


module.exports.ArgumentTypeError = ArgumentTypeError;
module.exports.string = string;
module.exports.boolean = boolean;
module.exports.json = json;
module.exports.array = array;
module.exports.integer = integer;
module.exports.float = float;
module.exports.number = number;
module.exports.date = date;
module.exports.path = path;
module.exports.url = url;
module.exports.map = {
  String: string,
  Boolean: boolean,
  Number: number,
  Date: date,
  Array: array,
  JSON: json
}

module.exports.enum = enumerable;
module.exports.list = list;
