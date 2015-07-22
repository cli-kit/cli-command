var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var bin = path.normalize(path.join(__dirname, '..', '..', 'bin'));

describe('cli-command:', function() {
  var exit;
  beforeEach(function(done) {
    exit = process.exit;
    done();
  });
  afterEach(function(done) {
    process.exit = exit;
    done();
  });
  it('should execute subcommand executable', function(done) {
    var cli = require('../../..')(pkg, 'mock-subcommand');
    cli.configure({exit: false, bin: bin, command: {exec: true}});
    var args = ['build'];
    cli.once('close', function() {
      done();
    })
    //console.log('program name is %s', cli.name());
    cli.command('build', 'build files')
    cli.parse(args);
  });
  it('should error on not found (EEXEC_NOENT)', function(done) {
    var cli = require('../../..')(pkg, 'mock-subcommand');
    cli.configure({exit: false, bin: bin, command: {exec: true}});
    var args = ['enoent'];
    cli.command('enoent', 'not found')
    cli.on('error', function(e) {
      e.error();
      done();
    })
    cli.parse(args);
  });
  it('should error on not found with invalid bin (EEXEC_NOENT)', function(done) {
    var cli = require('../../..')(pkg, 'mock-subcommand');
    cli.configure({exit: false, bin: false, command: {exec: true}});
    var args = ['enoent'];
    cli.command('enoent', 'not found')
    cli.on('error', function(e) {
      e.error();
      done();
    })
    cli.parse(args);
  });
  it('should error on permission denied (EPERM)', function(done) {
    var cli = require('../../..')(pkg, 'mock-subcommand');
    cli.configure({exit: false, bin: bin, command: {exec: true}});
    var args = ['eperm'];
    cli.command('eperm', 'permission denied')
    cli.on('error', function(e) {
      e.error();
      done();
    })
    cli.parse(args);
  });
  it('should error gracefully on SIGINT', function(done) {
    var cli = require('../../..')(pkg, 'mock-subcommand');
    cli.configure({exit: false, bin: bin, command: {exec: true}});
    var args = ['build'];
    process.exit = function(code) {
      expect(code).to.eql(0);
      done();
    }
    cli.command('build', 'build files')
    cli.on('exec', function(ps, cmd, args) {
      process.kill(ps.pid, 'SIGINT');
    })
    cli.parse(args);
  });
  it('should exit on subcommand executable', function(done) {
    var cli = require('../../..')(pkg, 'mock-subcommand');
    cli.configure({bin: bin, exit: true, command: {exec: true}});
    var args = ['build'];
    process.exit = function(code) {
      done();
    }
    cli.command('build', 'build files')
    var ps = cli.parse(args);
  });
})
