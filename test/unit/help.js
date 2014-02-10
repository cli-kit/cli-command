var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should execute help handler (zero commands)', function(done) {
    var cli = require('../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['-h'];
    cli.help().parse(args);
    done();
  });
  it('should execute help handler', function(done) {
    var cli = require('../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['-h'];
    cli
      .configure({usage: '[command] -h'})
      .command('test', 'a test command')
      .help()
      .parse(args);
    done();
  });
  it('should execute custom help handler', function(done) {
    var cli = require('../..')
    var help = cli.help;
    cli = cli(pkg, 'mock-custom-help');
    cli.configure({exit: false});
    var args = ['-h'];
    cli
      .command('test', 'a test command')
      .help(function() {
        expect(cli).to.eql(this);
        expect(help.head).to.be.a('function');
        expect(help.usage).to.be.a('function');
        expect(help.commands).to.be.a('function');
        expect(help.options).to.be.a('function');
        expect(help.foot).to.be.a('function');
        delete this._options.help;
        help.call(this);
        done();
      })
    cli.parse(args);
  });
  it('should display minimal help output', function(done) {
    var cli = require('../..')
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
