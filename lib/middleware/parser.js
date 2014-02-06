var parser = require('cli-argparse');
var define = require('cli-define');

/**
 *  Retrieve a configuration suitable for passing to
 *  the arguments parser.
 */
function getParserConfiguration() {
  var config = {
    alias: {}, flags: [], options: []}, k, arg, key, no = /^no/;
  for(k in this._arguments) {
    arg = this._arguments[k]; key = arg.key();
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
  return function(req, next) {
    //console.dir(req);
    var args = req.argv;
    var config = getParserConfiguration.call(this), handled;
    // TODO: deprecate this._args
    this._args = parser(args, config);
    this._args.config = config;
    req.result = this._args;
    next();
  }
}
