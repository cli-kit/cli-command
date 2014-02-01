var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
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
  it('should execute default uncaught code path from type converter',
    function(done) {
      function converter() {
        throw new Error('mock converter uncaught exception');
      }
      var listeners = process.listeners('uncaughtException').slice(0);
      process.removeAllListeners('uncaughtException');
      var cli = require('../../..')(pkg, 'mock-converter-uncaught');
      cli.on('exception', function(code, codes, parameters) {
        for(var i = 0;i < listeners.length;i++) {
          process.on('uncaughtException', listeners[i]);
        }
        done();
      });
      var args = ['-a'];
      cli.option('-a, --arguments', 'an argument', converter);
      process.nextTick(function(){
        cli.parse(args);
      });
    }
  );
})
