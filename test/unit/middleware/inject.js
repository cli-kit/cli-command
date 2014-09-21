var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should inject middleware', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.parser)
      .use(middleware.defaults)
      .use(1, middleware.unparsed);
    expect(cli._middleware.length).to.eql(3);
    var func = cli._middleware[1];
    var nm = func.name;
    expect(nm).to.eql('unparsed');
    done();
  });
});
