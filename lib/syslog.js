var logger = require('cli-logger');
var conf = {level: logger.NONE, console: true};
conf.prefix =  function(record) {
  return '[' + log.names(record.level) + ']';
}
var log = logger(conf, false);
module.exports.log = log;
