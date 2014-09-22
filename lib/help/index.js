var util = require('cli-util');

var json = require('./json').json;
var stringify = require('./json').stringify;
var documents = require('./doc');

module.exports = function help(keepalive, next, stream, converter) {
  var conf = this.configure()
    , converter, prefix, z, key
    , alias = this.finder.getCommandByName;
  var req = keepalive && (typeof keepalive === 'object')
    ? keepalive : this.request();
  var style = typeof keepalive === 'string'
    ? keepalive : process.env.CLI_TOOLKIT_HELP_STYLE || conf.help.style;
  stream = stream || process.stdout;
  var cmd;
  //console.dir(req.unparsed);
  if(req.unparsed.length) {
    cmd = alias(req.unparsed[0], this.commands())
  }
  // NOTE: this handles --help <cmd> syntax
  if(cmd && !process.env.CLI_TOOLKIT_HELP_CMD) {
    //console.log('got unparsed cmd %s', cmd.names());
    process.env.CLI_TOOLKIT_HELP_CMD = req.unparsed[0];
  }
  if(typeof next !== 'function' && !stream) {
    stream = next;
  }
  if(keepalive && typeof keepalive === 'object' && arguments.length == 1) {
    stream = keepalive;
  }
  if(style) {
    converter = documents[style];
    if(converter) converter = converter(this);
  }
  if(!converter) converter = documents.gnu(this);
  converter.style = style;
  var data = json.call(this);
  var listeners = this.listeners('help');
  if(listeners.length) {
    this.emit('help', data, converter, stream || process.stdout);
  }else{
    converter.write(data, stream);
  }

  process.env.CLI_TOOLKIT_HELP_CMD = '';
  this.emit('help:trailers', converter, data, stream);
  if(conf.exit && keepalive !== true) process.exit();
  if((keepalive === true || typeof keepalive === 'string')
     && typeof next === 'function') next();
  return false;
}

module.exports.fmt = require('./doc/formats');
module.exports.documents = documents;
module.exports.json = json;
module.exports.stringify = stringify;
module.exports.documents = documents;
module.exports.styles = Object.keys(documents);

// utilities
module.exports.pad = documents.gnu.pad;
module.exports.repeat = documents.gnu.repeat;
module.exports.longest = documents.gnu.longest;
module.exports.section = documents.gnu.section;
