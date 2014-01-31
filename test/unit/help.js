var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var exit;
process.setMaxListeners(256);

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
  it('should execute help handler (zero commands)', function(done) {
    var cli = require('../..')(pkg, 'mock-help');
    var args = ['-h'];
    cli.help().parse(args);
    done();
  });
  it('should execute help handler', function(done) {
    var cli = require('../..')(pkg, 'mock-help');
    var args = ['-h'];
    cli
      .usage('[command] -h')
      .command('test', 'a test command')
      .help()
      .parse(args);
    done();
  });
  it('should execute custom help handler', function(done) {
    var cli = require('../..')(pkg, 'mock-custom-help');
    var args = ['-h'];
    cli
      .command('test', 'a test command')
      .help(function(help) {
      expect(cli).to.eql(this);
      expect(help.head).to.be.a('function');
      expect(help.usage).to.be.a('function');
      expect(help.commands).to.be.a('function');
      expect(help.options).to.be.a('function');
      expect(help.foot).to.be.a('function');
      delete this._arguments.help;
      help.call(this);
      done();
    })
    cli.parse(args);
  });
})
