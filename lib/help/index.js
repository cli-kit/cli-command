var util = require('cli-util');

var json = require('./json').json;
var stringify = require('./json').stringify;
var documents = require('./doc');

module.exports = function(keepalive, next, stream, converter) {
  var conf = this.configure(), converter, prefix, z, key;
  if(typeof next !== 'function' && !stream) {
    stream = next;
  }
  if(keepalive && typeof keepalive === 'object' && arguments.length == 1) {
    stream = keepalive;
  }
  if(!converter) {
    if(conf.help && conf.help.style) {
      converter = documents[conf.help.style];
      if(converter) converter = converter(this);
    }
    if(!converter) converter = documents.gnu(this);
  }
  var data = json.call(this);
  var listeners = this.listeners('help');
  if(listeners.length) {
    this.emit('help', data, converter, stream || process.stdout);
  }else{
    converter.write(data, stream);
  }
  if(conf.exit && keepalive !== true) process.exit();
  if(keepalive === true && typeof next === 'function') next();
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
