var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should handle action middleware with no parser', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.action)
      .on('complete', function(req) {
        expect(this._middleware.length).to.eql(1);
        done();
      })
      .parse([]);
  });
});
