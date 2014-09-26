var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
//var exit;

describe('cli-command:', function() {
  it('should set program version', function(done) {
    var cli = require('../..')(
      path.join(__dirname, '..', '..', 'package.json'));
    var ver = '0.0.1';
    cli.version(ver);
    expect(cli.version()).to.eql(ver);
    done();
  });
  it('should set program version with name and description', function(done) {
    var cli = require('../..')(
      path.join(__dirname, '..', '..', 'package.json'));
    var ver = '0.0.1', name = '-v', description = 'print version';
    cli.version(ver, name, description);
    expect(cli._version).to.eql(ver);
    expect('' + cli._options.versionopt.description()).to.eql(description);
    done();
  });
  it('should set program version as action', function(done) {
    var cli = require('../..')(
      path.join(__dirname, '..', '..', 'package.json'));
    function version(){}
    cli.version(version);
    expect(cli._options.versionopt.action()).to.eql(version);
    done();
  });
  it('should execute version handler', function(done) {
    var cli = require('../..')(pkg, 'mock-version');
    cli.configure({exit: false});
    var args = ['--version'];
    cli.version().parse(args);
    done();
  });
  it('should execute custom version handler', function(done) {
    var cli = require('../..')
    var version = cli.version;
    cli = cli(pkg, 'mock-custom-version');
    cli.configure({exit: false});
    var args = ['--version'];
    cli.version(function() {
      expect(cli).to.eql(this);
      version.call(this, false, 'some more version info');
      done();
    }).parse(args);
  });
})
