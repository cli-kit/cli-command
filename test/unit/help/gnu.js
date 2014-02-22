var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should execute help handler (zero commands)', function(done) {
    var cli = require('../../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['-h'];
    cli.help().parse(args);
    done();
  });
  it('should execute help handler', function(done) {
    var cli = require('../../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .help()
      .parse(args);
    done();
  });
  it('should set wrap column', function(done) {
    var cli = require('../../..')(pkg, 'mock-column-help');
    cli.configure({exit: false, help: {column: 40}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command with a really long description')
      .help()
      .parse(args);
    cli.configure({help: {column: 80}});
    done();
  });
  it('should use default column value (false)', function(done) {
    var cli = require('../../..')(pkg, 'mock-column-help');
    cli.configure({exit: false, help: {column: false}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command with a really long description')
      .help()
      .parse(args);
    cli.configure({help: {column: 80}});
    done();
  });
  it('should print vanilla help', function(done) {
    var cli = require('../../..')(pkg, 'mock-vanilla-help');
    cli.configure({exit: false, help: {vanilla: true}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .help()
      .parse(args);
    done();
  });
  it('should disable section titles', function(done) {
    var cli = require('../../..')(pkg, 'mock-title-help');
    cli.configure({exit: false, help: {title: false}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .help()
      .parse(args);
    done();
  });
  it('should disable section titles', function(done) {
    var cli = require('../../..')(pkg, 'mock-null-title-help');
    cli.configure({exit: false, help: {title: null}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .help()
      .parse(args);
    done();
  });
  it('should disable section titles (CLI_TOOLKIT_HELP_MAN)', function(done) {
    process.env.CLI_TOOLKIT_HELP_MAN = true;
    var cli = require('../../..')(pkg, 'mock-env-title-help');
    cli.configure({exit: false});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .help()
      .parse(args);
    delete process.env.CLI_TOOLKIT_HELP_MAN;
    done();
  });
  it('should customize section titles', function(done) {
    var cli = require('../../..')(pkg, 'mock-custom-title-help');
    cli.configure(
      {exit: false, help: {title: {commands: 'Command:', options: 'Option:'}}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .help()
      .parse(args);
    done();
  });
  it('should sort help keys', function(done) {
    var cli = require('../../..')(pkg, 'mock-sort-help');
    cli.configure({exit: false, help: {sort: true}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .command('sort', 'a command to sort before')
      .help()
      .parse(args);
    done();
  });
  it('should sort help keys (function)', function(done) {
    var cli = require('../../..')(pkg, 'mock-sort-help');
    function sort(a, b) {
      return a.localeCompare(b);
    }
    cli.configure(
      {exit: false, help: {sort: sort}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .command('sort', 'a command to sort before')
      .help()
      .parse(args);
    done();
  });
  it('should override default sort behaviour (no sort)', function(done) {
    var cli = require('../../..')(pkg, 'mock-sort-help');
    cli.configure({exit: false, help: {sort: false}});
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .command('sort', 'a command to sort in natural order')
      .help()
      .parse(args);
    done();
  });
  it('should display minimal help output', function(done) {
    var cli = require('../../..')
    var help = cli.help;
    var args = [];
    cli = cli(pkg, 'mock-minimal-help')
      .configure({exit: false})
      .on('empty', function(help, version) {
        help.call(this);
        done();
      })
      .parse(args);
  });
})
