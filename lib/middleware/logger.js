var fs = require('fs');
var util = require('util');
var define = require('cli-define').define;
var logger = require('cli-logger');
var color = require('./color');

var defaults = {
  level: {
    name: '--log-level [level]',
    description: 'set the log level',
    key: 'logLevel',
    callback: function level(req, arg, value) {
      var level = parseInt(value);
      if(!isNaN(level)) value = level;
      try {
        this.log.level(value);
      }catch(e) {
        this.raise(this.errors.EUNKNOWN_LOG_LEVEL, [value], e);
      }
    }
  },
  file: {
    name: '--log-file [file]',
    description: 'redirect to log file',
    key: 'logFile',
    callback: function file(req, arg, value) {
      var logger = require('cli-logger'), scope = this;
      var streams = this.log.streams, stream;
      stream = fs.createWriteStream(value, {flags: 'a'});
      stream.once('error', function(e) {
        scope.raise(scope.errors.ELOG_FILE, [value], e);
      })
      for(var i = 0;i < streams.length;i++) {
        streams[i].stream = stream;
        streams[i].type = logger.FILE;
      }
    }
  }
}

var keys = Object.keys(defaults);

var callbacks = {};
keys.forEach(function(key) {
  callbacks[defaults[key].key] = defaults[key].callback;
})

function configure(options) {
  var i, key;
  for(i = 0;i < keys.length;i++) {
    key = keys[i];
    if(options[key] && typeof(options[key]) === 'object'
      && !Array.isArray(options[key])) {
        options[key].name = options[key].name || defaults[key].name;
        options[key].description = options[key].description
          || defaults[key].description;
        this.option(options[key]);
        this.once(defaults[key].key, function(req, arg, value) {
          callbacks[arg.key()].call(this, req, arg, value);
        })
    }
  }
}

/**
 *  Decorates the program with a logger assigned to the log
 *  property of the program.
 *
 *  @param conf A configuration to pass when initializing
 *  the logger module.
 *  @param options An object defining common log options.
 */
module.exports = function(conf, options) {
  conf = conf || this.configure().log || {};

  if(!this.configure().log) {
    this.configure().log = conf;
  }

  var scope = this;
  var bitwise = conf && conf.bitwise !== undefined ? conf.bitwise : false;
  if(conf && conf.bitwise) delete conf.bitwise;
  var log = logger(conf, bitwise);

  if(color.use && conf.colors !== false) {
    var ansi = require('ttycolor').ansi;

    //console.log(ansi.color);

    // prefer a console stream if colors are enabled
    // and the logger has not been configured with custom streams
    if(log.isDefault()) {
      log.useConsoleStream();

      // prefer a default prefix that styles differently
      log.conf.prefix = (conf.prefix !== undefined)
        ? conf.prefix : function(record, tty) {
          var fmt = conf.format || '[%s]', nm = scope.name();
          if(!tty) {
            return util.format(fmt, nm);
          }
          //console.log(
            //'default color prefixer %s',
            //ansi(util.format(fmt, nm)).normal.bg.black);
          //return ansi(util.format(fmt, nm)).normal.bg.black;
          var c = ansi(util.format(fmt, nm)).normal.bg.black;
          //console.log('is instance %s', c instanceof ansi.color);
          //console.dir(c);
          return c;
        }
    }
  }else{
    conf.prefix = conf.prefix !== undefined ? conf.prefix : function(record) {
      var fmt = conf.format || '[%s]', nm = scope.name();
      return util.format(fmt, nm);
    }
  }
  define(this, 'log', log, false);
  if(options) configure.call(this, options);
  return this;
}
