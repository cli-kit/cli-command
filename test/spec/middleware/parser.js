var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should ignore misconfigured option', function(done) {
    var cli = require('../../..');
    cli = cli()
      .use(require('cli-mid-parser'));
    cli._options.misconfigured = {};
    cli.parse([]);
    done();
  });
});
