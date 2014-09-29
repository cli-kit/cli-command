var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should handle invalid configuration', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    cli.configure(false);
    var config = cli.configure();
    // exit is false in test mode
    expect(config.exit).to.eql(false);
    expect(config.bin).to.eql(null);
    done();
  });
  it('should use default configuration', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    var config = cli.configure();
    // exit is false in test mode
    expect(config.exit).to.eql(false);
    expect(config.bin).to.eql(null);
    done();
  });
  it('should set configuration (exit)', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    cli.configure({exit: true});
    var config = cli.configure();
    expect(config.exit).to.eql(true);
    expect(config.bin).to.eql(null);
    done();
  });
  it('should set configuration (bin)', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    cli.configure({bin: './bin'});
    var config = cli.configure();
    // exit is false in test mode
    expect(config.exit).to.eql(false);
    expect(config.bin).to.eql('./bin');
    done();
  });
})
