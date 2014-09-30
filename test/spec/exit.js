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
    cli.configure({exit: true});
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
    cli.configure({exit: true});
    process.exit = function(code) {
      done();
    }
    var args = ['--help'];
    cli
      .help()
      .parse(args);
  });

  it('should exit on version', function(done) {
    var cli = require('../..')(pkg, 'mock-version-exit');
    cli.configure({exit: true});
    process.exit = function(code) {
      done();
    }
    var args = ['--version'];
    cli.version().parse(args);
  });
})
