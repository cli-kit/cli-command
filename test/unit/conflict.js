var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
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
  it('should exit on property conflict', function(done) {
    var cli = require('../..')(pkg, 'mock-conflict');
    var args = [];
    process.exit = function(code) {
      done();
    }
    cli.option('-a, --action [action]', 'argument property conflict')
    cli.parse(args);
  });
})
