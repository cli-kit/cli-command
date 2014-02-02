var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should execute default uncaught code path', function(done) {
    var listeners = process.listeners('uncaughtException').slice(0);
    process.removeAllListeners('uncaughtException');
    var cli = require('../..')(pkg, 'mock-uncaught');
    cli.configuration({exit: false});
    cli.once('error', function(e) {
      for(var i = 0;i < listeners.length;i++) {
        process.on('uncaughtException', listeners[i]);
      }
      done();
    });
    var args = ['uncaught'];
    cli
      .command('uncaught')
        .description('uncaught')
        .action( function(cmd, opts, raw) {
          throw new Error('an uncaught error');
          for(var i = 0;i < listeners.length;i++) {
            process.on('uncaughtException', listeners[i]);
          }
        })
    process.nextTick(function(){
      cli.parse(args);
    });
  });
})
