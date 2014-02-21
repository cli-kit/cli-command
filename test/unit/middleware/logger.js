var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should use logger middleware', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.logger)
      .on('complete', function(req) {
        expect(this.log).to.be.an('object');
        expect(this.log).to.be.instanceof(require('cli-logger').Logger);
        done();
      })
      .parse([]);
  });
  it('should print error via logger', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli(null, 'mock-logger-error')
      .configure({exit: false})
      .use(middleware.logger)
      .option('--required <value>', 'required option')
      .on('complete', function(req) {
        done();
      })
      .parse([]);
  });
});
