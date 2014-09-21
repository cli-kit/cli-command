var define = require('cli-define');
var merge = require('cli-util').merge;
var argparse = require('cli-argparse');

/**
 *  Retrieve a configuration suitable for passing to
 *  the arguments parser.
 */
function getParserConfiguration(target, config) {
  target = target || this;
  config = config || {alias: {}, flags: [], options: []};
  var k, arg, key
    , conf  = this.configure();
  var no = /^\[?no\]?/, nor = define.re.no();
  for(k in target._options) {
    arg = target._options[k];
    if(!(arg instanceof define.Flag) && !(arg instanceof define.Option)) {
      continue;
    }
    var names = arg.names().slice(0);
    names.forEach(function(nm, index, arr) {
      arr[index] = nm.replace(nor, '');
    })
    key = arg.key();
    //console.log('key: %s', key);
    if(no.test(key)) {
      // this works around an issue with args such as --noop
      // without the charAt test the id is *op*
      // ensuring the first character is uppercase is akin to
      // checking the declaration was '[no]-'
      if(/^[A-Z]$/.test(key.charAt(2))) {
        key = key.replace(no, '');
        key = key.charAt(0).toLowerCase() + key.slice(1);
      }
      //console.log('final key: %s', key);
    }
    config.alias[names.join(' ')] = key;
    if(arg instanceof define.Flag) {
      config.flags = config.flags.concat(names);
    }else{
      config.options = config.options.concat(names);
    }
  }

  // TODO: sometimes child options have the same keys
  // TODO: as top-level options, these duplicates can be removed
  for(k in target._commands) {
    getParserConfiguration.call(this, target._commands[k], config);
  }

  if(conf.variables && conf.variables.prefix) {
    config.vars = {variables: conf.variables.prefix};
  }

  return config;
}

/**
 *  Parses command line arguments, typically you would want
 *  this to be the first middleware.
 */
module.exports = function() {
  var conf = this.configure();
  return function parser(req, next) {
    var args = req.argv;
    var config = getParserConfiguration.call(this);
    if(typeof conf.parser.configure === 'function') {
      conf.parser.configure.call(this, config);
    }
    //console.dir(config);
    var result = argparse(args, config);
    result.keys = Object.keys(result.flags).concat(Object.keys(result.options));
    result.all = {};
    merge(result.flags, result.all);
    merge(result.options, result.all);
    result.config = config;
    req.result = result;
    //console.log(JSON.stringify(req.result, undefined, 2));
    this.request(req);
    next();
  }
}
