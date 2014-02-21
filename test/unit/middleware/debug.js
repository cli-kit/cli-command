var path = require('path');
var expect = require('chai').expect;

describe('cli-command:', function() {
  it('should use debug middleware', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.debug)
      .on('complete', function(req) {
        expect(this.debug).to.eql(true);
        done();
      })
      .parse(['--debug']);
  });
  it('should use debug middleware (--no-debug)', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.debug)
      .on('complete', function(req) {
        expect(this.debug).to.eql(false);
        done();
      })
      .parse(['--no-debug']);
  });
  it('should use debug middleware with logger', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.logger)
      .use(middleware.debug)
      .on('complete', function(req) {
        expect(this.debug).to.eql(true);
        done();
      })
      .parse(['--debug']);
  });
  it('should use debug middleware with bitwise logger', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.logger, {bitwise: true})
      .use(middleware.debug)
      .on('complete', function(req) {
        expect(this.debug).to.eql(true);
        done();
      })
      .parse(['--debug']);
  });
});
