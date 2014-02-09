var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var bin = path.normalize(path.join(__dirname, '..', 'bin'));
var exit;

describe('cli-command:', function() {
  beforeEach(function(done) {
    exit = process.exit;
    done();
  });
  afterEach(function(done) {
    process.exit = exit;
    done();
  });
  it('should exit on erequired error', function(done) {
    var cli = require('../..')(pkg, 'mock-erequired-error');
    process.exit = function(code) {
      done();
    }
    var args = [];
    cli
      .option('--required <value>', 'required options')
      .parse(args);
  });
  it('should exit on help', function(done) {
    var cli = require('../..')(pkg, 'mock-help-exit');
    process.exit = function(code) {
      done();
    }
    var args = ['-h'];
    cli.help().parse(args);
  });
  it('should exit on version', function(done) {
    var cli = require('../..')(pkg, 'mock-version-exit');
    process.exit = function(code) {
      done();
    }
    var args = ['-V'];
    cli.version().parse(args);
  });
  it('should exit on subcommand executable', function(done) {
    var cli = require('../..')(pkg, 'mock-subcommand');
    cli.configure({bin: bin, exit: true});
    var args = ['build'];
    process.exit = function(code) {
      done();
    }
    cli.command('build', 'build files')
    var ps = cli.parse(args);
  });
})
