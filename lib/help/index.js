var util = require('cli-util');

var json = require('./json').json;
var stringify = require('./json').stringify;
var converters = require('./doc');

module.exports = function(alive) {
  var conf = this.configure(), converter, prefix, z, key;
  if(conf.help && conf.help.style) {
    converter = converters[conf.help.style];
    if(converter) converter = converter(this);
  }
  if(!converter) converter = converters.gnu(this);
  var data = json.call(this);
  var listeners = this.listeners('help');
  if(listeners.length) {
    this.emit('help', data, converter, process.stdout);
  }else{
    converter.write(data);
  }
  if(conf.exit && alive !== true) process.exit();
  return false;
}

module.exports.fmt = require('./doc/formats');
module.exports.json = json;
module.exports.stringify = stringify;
module.exports.converters = converters;
module.exports.styles = Object.keys(converters);

// utilities
module.exports.pad = converters.gnu.pad;
module.exports.repeat = converters.gnu.repeat;
module.exports.longest = converters.gnu.longest;
module.exports.section = converters.gnu.section;
