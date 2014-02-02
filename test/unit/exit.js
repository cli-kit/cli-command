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
  it('should exit on subcommand executable', function(done) {
    var cli = require('../..')(pkg, 'mock-subcommand');
    cli.configuration({bin: bin, exit: true});
    var args = ['build'];
    process.exit = function(code) {
      done();
    }
    cli.command('build', 'build files')
    var ps = cli.parse(args);
  });
})
