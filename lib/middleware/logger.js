var define = require('cli-define').define;
var color = require('./color');

var defaults = {
  level: {
    name: '--log-level [level]',
    description: 'set the log level',
    key: 'logLevel',
    callback: function level(req, arg, value) {
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
      //TODO
    }
  },
  stdout: {
    name: '--stdout [file]',
    description: 'redirect stdout to log file',
    key: 'stdout',
    callback: function stdout(req, arg, value) {
      //TODO
    }
  },
  stderr: {
    name: '--stderr [file]',
    description: 'redirect stderr to log file',
    key: 'stderr',
    callback: function stderr(req, arg, value) {
      //TODO
    }
  }
}

var keys = Object.keys(defaults);

var callbacks = {};
keys.forEach(function(key) {
  callbacks[defaults[key].key] = defaults[key].callback;
})

function configure(options) {
  var i, key, cb;
  for(i = 0;i < keys.length;i++) {
    key = keys[i];
    if(options[key] && typeof(options[key]) === 'object'
      && !Array.isArray(options[key])) {
        options[key].name = options[key].name || defaults[key].name;
        options[key].description = options[key].description
          || defaults[key].description;
        this.option(options[key]);
        this.once(defaults[key].key, function(req, arg, value) {
          //console.log('got argument event %s %s', value, arg.key());
          //console.dir(callbacks[arg.key()]);
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
  conf = conf || this.configure().log;
  var logger = require('cli-logger');
  var scope = this;
  if(color.use && !conf) {
    conf = {
      console: true,
      prefix: function(record) {
        return scope.name() + ': ';
      }
    };
  }
  var log = logger(conf);
  define(this, 'log', log, false);
  if(options) configure.call(this, options);
  return this;
}
