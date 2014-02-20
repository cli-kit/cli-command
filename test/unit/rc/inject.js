var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should return on zero arguments', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    expect(middleware.rc()()).to.eql(undefined);
    done();
  });
  it('should inject rc middleware', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .configure({rc: {merge: false}})
      .parse([]);
    done();
  });
});
