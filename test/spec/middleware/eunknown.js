var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should handle eunknown middleware without unparsed', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.parser)
      .use(middleware.eunknown)
      .parse([]);
    expect(cli._middleware.length).to.eql(2);
    done();
  });
});
