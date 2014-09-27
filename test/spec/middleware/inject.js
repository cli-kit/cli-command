var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should inject middleware', function(done) {
    var cli = require('../../..');
    cli = cli()
      .use(require('cli-mid-parser'))
      .use(require('cli-mid-defaults'))
      .use(1, require('cli-mid-unparsed'));
    expect(cli._middleware.length).to.eql(3);
    var func = cli._middleware[1];
    var nm = func.name;
    expect(nm).to.eql('unparsed');
    done();
  });
});
