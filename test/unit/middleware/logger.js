var path = require('path');
var expect = require('chai').expect;
var ttycolor = require('ttycolor');
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
  it('should use logger middleware with configuration', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.logger, {console: false})
      .on('complete', function(req) {
        var keys = Object.keys(this);
        var enumerated = [];
        for(var z in this) {
          enumerated.push(z);
        }
        expect(keys).to.eql(enumerated).to.eql([]);
        done();
      })
      .parse([]);
  });
  it('should print error via logger', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli(null, 'mock-logger-error')
      .configure({exit: false})
      .use(middleware.color)
      .use(middleware.logger)
      .option('--required <value>', 'required option')
      .on('complete', function(req) {
        if(typeof ttycolor.revert === 'function') ttycolor.revert();
        done();
      })
      .parse([]);
  });
});
