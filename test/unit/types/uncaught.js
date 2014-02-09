var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var ArgumentTypeError = require('../../..').error.type;

describe('cli-command:', function() {
  it('should execute default uncaught code path from type converter',
    function(done) {
      function converter() {
        throw new Error('mock converter uncaught exception');
      }
      var listeners = process.listeners('uncaughtException').slice(0);
      process.removeAllListeners('uncaughtException');
      var cli = require('../../..')(pkg, 'mock-converter-uncaught');
      cli.configure({exit: false});
      cli.once('error', function(e) {
        expect(e).to.be.an.instanceof(ArgumentTypeError);
        for(var i = 0;i < listeners.length;i++) {
          process.on('uncaughtException', listeners[i]);
        }
        done();
      });
      var args = ['-v'];
      cli.option('-v, --verbose', 'verbose argument', converter);
      process.nextTick(function(){
        cli.parse(args);
      });
    }
  );
})
