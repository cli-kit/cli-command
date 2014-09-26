var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should prepend middleware (zero index)', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.parser)
      .use(0, middleware.defaults);
    expect(cli._middleware.length).to.eql(2);
    var func = cli._middleware[0];
    var nm = func.name;
    expect(nm).to.eql('defaults');
    done();
  });
});
