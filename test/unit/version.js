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
  it('should execute version handler', function(done) {
    var cli = require('../..')(pkg, 'mock-version');
    var args = ['-V'];
    cli.version().parse(args);
    done();
  });
  it('should execute custom version handler', function(done) {
    var cli = require('../..')(pkg, 'mock-custom-version');
    var args = ['-V'];
    cli.version(function(version) {
      expect(cli).to.eql(this);
      version.call(this, false, 'some more version info');
      done();
    }).parse(args);
  });
})
