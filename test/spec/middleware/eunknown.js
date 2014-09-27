var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should handle eunknown middleware without unparsed', function(done) {
    var cli = require('../../..');
    cli = cli()
      .use(require('cli-mid-parser'))
      .use(require('cli-mid-eunknown'))
      .parse([]);
    expect(cli._middleware.length).to.eql(2);
    done();
  });
});
