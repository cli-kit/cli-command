var types = require('cli-types');
var ArgumentTypeError = types.ArgumentTypeError;
var funcname = require('cli-util').funcname;

/**
 *  Retrieve the converter reference for an argument,
 *  respecting the type map.
 *
 *  @param arg The argument definition.
 *  @param func A specific function.
 *  @param req The middleware request object.
 */
function getConverter(arg, func, req) {
  var converter = func || arg.converter()
    , name
    , alias = this.finder.getCommandByName;

  if(Array.isArray(converter)) return converter;
  if(typeof converter === 'function') {
    name = converter.name;
  }
  if(name && types.map[name]) return types.map[name];
  if(arg && arg.converter() === JSON) return types.map.JSON;

  // lookup converters that are objects as a map
  // of command keys to converter functions (or arrays)
  if(req &&
    converter !== JSON,
    typeof converter === 'object' && !Array.isArray(converter)) {
    var cmd = req.result.unparsed[0], arg;
    //console.log('look for converter on %s', cmd);
    if(cmd) {
      arg = alias(cmd, this._commands);
      //console.log('got arg %s', arg.key());
      if(arg) {
        //console.log('convert on command map %s %s', cmd, arg.key());
        //console.log('got commands %s', this._commands);
        if(converter[arg.key()]) {
          //console.log('found converter for command %s', converter[arg.key()]);
          converter = converter[arg.key()];
        }
      }
    }
    if(!cmd || !arg || !converter[arg.key()]) {
      converter = converter.default;
    }
  }

  //console.log('got converter %s on %s', converter, arg.names());
  return converter;
}

/**
 *  Attempts to retrieve string names from the functions or
 *  constructors specified as converter(s).
 *
 *  @param arg The argument definition.
 *
 *  @return An array of names.
 */
function getConverterNames(arg) {
  var converter = arg.converter(), names = [], i, name;
  for(i = 0;i < converter.length;i++) {
    try{
      name = funcname(converter[i]);
      if(name) name = name.toLowerCase();
      names.push(name);
    }catch(e){}
  }
  return names;
}

/**
 *  Convert an arguments value.
 *
 *  @param value The parsed argument value.
 *  @param arg The argument definition.
 *  @param index The index into an array (multiple only).
 */
function convert(value, arg, index, req) {
  var errors = this.errors;
  var converter = getConverter.call(this, arg, null, req), i, func;
  function error(e, message, parameters) {
    if(e instanceof ArgumentTypeError) {
      if(e.code == 1) e.code = errors.ETYPE.code;
      e.key = errors.ETYPE.key;
      throw e;
    }else{
      e = new ArgumentTypeError(e, e.parameters || [], errors.ETYPE.code);
      throw e;
    }
  }
  function invoke(converter, fast) {
    try {
      value = converter.call(this, value, arg, index);
    }catch(e) {
      if(!fast) throw e;
      error.call(this, e);
    }
    return value;
  }
  if(Array.isArray(converter)) {
    for(i = 0;i < converter.length;i++) {
      func = getConverter.call(this, arg, converter[i]);
      try {
        return invoke.call(this, func, false);
      }catch(e) {
        // NOTE: all coercion attempts failed
        if(i == (converter.length -1)) {
          error.call(this, e, 'invalid type for %s, expected (%s)',
            [arg.toString(null), getConverterNames(arg).join(', ')]);
        }
      }
    }
  }else{
    invoke.call(this, converter, true);
  }
  return value;
}

/**
 *  Coerce an argument value using an assigned converter
 *  function.
 *
 *  @param arg The argument definition.
 *  @param v The value as specified on the command line.
 */
function coerce(arg, v, req) {
  var type = false, i, scope = this;
  var converter = getConverter.call(this, arg, null, req);
  // NOTE: we check whether the converter is one of
  // NOTE: the built in converters as they are responsible
  // NOTE: for handling array values, other custom converters
  // NOTE: are invoked for each array entry if the argument
  // NOTE: value has already been converted to an array
  var keys = Object.keys(types);
  for(i = 0;i < keys.length;i++) {
    if(types[keys[i]] === converter) {
      type = true; break;
    }
  }
  //console.dir(converter);
  if(typeof converter == 'function' || Array.isArray(converter)) {
    if(Array.isArray(v) && !type) {
      v.forEach(function(value, index, arr) {
        arr[index] = convert.call(scope, value, arg, index, req);
      });
    }else{
      v = convert.call(this, v, arg, -1, req);
    }
  }

  return v;
}

module.exports = {};
module.exports.coerce = coerce;
