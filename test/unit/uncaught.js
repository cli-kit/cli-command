var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var exit;

describe('cli-command:', function() {
  beforeEach(function(done) {
    exit = process.exit;
    process.exit = function(code) {return code;}
    done();
  });
  afterEach(function(done) {
    process.exit = exit;
    done();
  });
  it('should execute default uncaught code path', function(done) {
    var listeners = process.listeners('uncaughtException').slice(0);
    process.removeAllListeners('uncaughtException');
    var cli = require('../..')(pkg, 'mock-uncaught');
    cli.on('exception', function(code, codes, parameters) {
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
