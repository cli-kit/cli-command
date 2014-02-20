var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should ignore misconfigured option', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.parser);
    cli._options.misconfigured = {};
    cli.parse([]);
    done();
  });
});
