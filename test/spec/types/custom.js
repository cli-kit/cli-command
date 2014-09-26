var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should use custom converter function (always error)', function(done) {
    var cli = require('../../..')(pkg);
    var custom = function(value, arg, index) {
      if(!arguments.length) return;
      throw new Error('Invalid value');
    }
    var value = 'value';
    var args = ['-a', value];
    cli
      .configure({exit: false})
      .option('-a, --array <a>', 'an array argument', [custom])
      .on('error', function(e) {
        expect(e).to.be.instanceof(Error);
        done();
      })
    cli.parse(args);
  });
})
