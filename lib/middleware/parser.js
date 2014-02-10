var define = require('cli-define');
var merge = require('cli-util').merge;
var argparse = require('cli-argparse');

/**
 *  Retrieve a configuration suitable for passing to
 *  the arguments parser.
 */
function getParserConfiguration() {
  var config = {
    alias: {}, flags: [], options: []}, k, arg, key, no = /^no/;
  for(k in this._options) {
    arg = this._options[k]; key = arg.key();
    if(key) {
      if(no.test(key)) {
        key = key.replace(no, '');
        key = key.charAt(0).toLowerCase() + key.slice(1);
      }
      config.alias[arg.names().join(' ')] = key;
    }
    if(arg instanceof define.Flag) {
      config.flags = config.flags.concat(arg.names());
    }else if(arg instanceof define.Option) {
      config.options = config.options.concat(arg.names());
    }
  }
  return config;
}

/**
 *  Parses command line arguments, typically you would want
 *  this to be the first middleware.
 */
module.exports = function() {
  return function parser(req, next) {
    if(!arguments.length) return;
    //console.dir(req);
    var args = req.argv;
    var config = getParserConfiguration.call(this), handled;
    var result = argparse(args, config);
    result.keys = Object.keys(result.flags).concat(Object.keys(result.options));
    result.all = {};
    merge(result.flags, result.all);
    merge(result.options, result.all);
    result.config = config;
    //console.dir(result);
    req.result = result;
    this.request(req);
    next();
  }
}
