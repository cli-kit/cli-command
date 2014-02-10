var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should use default configuration', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    var args = [];
    //cli
      //.parse(args);
    var config = cli.configure();
    expect(config.exit).to.eql(true);
    //expect(config.stash).to.eql(null);
    expect(config.bin).to.eql(null);
    done();
  });
  it('should set configuration (exit)', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    var args = [];
    cli
      .configure({exit: false})
      .parse(args);
    var config = cli.configure();
    expect(config.exit).to.eql(false);
    //expect(config.stash).to.eql(null);
    expect(config.bin).to.eql(null);
    done();
  });
  it('should set configuration (bin)', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    var args = [];
    cli
      .configure({bin: './bin'})
      .parse(args);
    var config = cli.configure();
    expect(config.exit).to.eql(true);
    //expect(config.stash).to.eql(null);
    expect(config.bin).to.eql('./bin');
    done();
  });
})
