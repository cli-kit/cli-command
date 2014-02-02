var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
//var exit;

describe('cli-command:', function() {
  it('should execute version handler', function(done) {
    var cli = require('../..')(pkg, 'mock-version');
    cli.configuration({exit: false});
    var args = ['-V'];
    cli.version().parse(args);
    done();
  });
  it('should execute custom version handler', function(done) {
    var cli = require('../..')(pkg, 'mock-custom-version');
    cli.configuration({exit: false});
    var args = ['-V'];
    cli.version(function(version) {
      expect(cli).to.eql(this);
      version.call(this, false, 'some more version info');
      done();
    }).parse(args);
  });
})
