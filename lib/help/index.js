var util = require('cli-util');

var json = require('./json').json;
var stringify = require('./json').stringify;
var converters = require('./doc');

//var COMMANDS = 'commands';
//var OPTIONS = 'options';
//var titles = {};
//titles[COMMANDS] = 'Commands:';
//titles[OPTIONS] = 'Options:';

//function title(key) {
  //var conf = this.configure();
  //if(!conf.help
    //|| conf.help.title === false);
  //if(conf.help.title === true) {
    //return titles[key];
  //}else if(conf.help.title && conf.help.title[key]) {
    //return conf.help.title[key];
  //}
  //return false;
//}

module.exports = function(alive) {
  var config = this.configure(), converter, prefix, z, key;
  if(!process.env.CLI_TOOLKIT_HELP2MAN) {
    prefix = 'CLI_TOOLKIT_HELP_';
    for(z in converters) {
      key = prefix + z.toUpperCase();
      if(process.env[key] && converters[z]) {
        converter = converters[z]();
        break;
      }
    }
  }
  if(!converter) converter = converters.gnu();
  var data = json.call(this);
  var listeners = this.listeners('help');
  if(listeners.length) {
    this.emit('help', converter);
  }else{
    converter.write(this, data);
  }
  if(config.exit && alive !== true) process.exit();
  return false;
}

module.exports.json = json;
module.exports.stringify = stringify;

// utilities
module.exports.pad = converters.gnu.pad;
module.exports.repeat = converters.gnu.repeat;
module.exports.longest = converters.gnu.longest;
module.exports.section = converters.gnu.section;
