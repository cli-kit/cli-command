var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should use default configuration', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    var args = [];
    //cli
      //.parse(args);
    var config = cli.configuration();
    expect(config.exit).to.eql(true);
    done();
  });
  it('should set configuration (exit)', function(done) {
    var cli = require('../..')(pkg, 'configuration');
    var args = [];
    cli
      .configuration({exit: false})
      .parse(args);
    var config = cli.configuration();
    expect(config.exit).to.eql(false);
    done();
  });
})
