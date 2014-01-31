var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg, 'mock-subcommand');
var bin = path.normalize(path.join(__dirname, '..', 'bin'));

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
  it('should execute subcommand executable', function(done) {
    var args = ['build'];
    cli.once('close', function() {
      done();
    })
    cli.command('build', 'build files')
    cli.parse(args, {bin: bin});
  });
  it('should error on not found (ENOENT)', function(done) {
    var args = ['enoent'];
    cli.command('enoent', 'not found')
    cli.parse(args, {bin: bin});
    done();
  });
  it('should error on permission denied (EPERM)', function(done) {
    var args = ['eperm'];
    cli.command('eperm', 'permission denied')
    cli.parse(args, {bin: bin});
    done();
  });
  it('should error gracefully on SIGINT', function(done) {
    var args = ['build'];
    process.exit = function(code) {
      expect(code).to.eql(0);
      done();
    }
    cli.command('build', 'build files')
    var ps = cli.parse(args, {bin: bin});
    process.kill(ps.pid, 'SIGINT');
  });
})
