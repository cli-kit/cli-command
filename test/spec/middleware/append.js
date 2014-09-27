var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should append middleware (negative index)', function(done) {
    var cli = require('../../..');
    cli = cli()
      .use(require('cli-mid-parser'))
      .use(-1, require('cli-mid-defaults'));
    expect(cli._middleware.length).to.eql(2);
    var func = cli._middleware[1];
    var nm = func.name;
    expect(nm).to.eql('defaults');
    done();
  });
  it('should append middleware (out of bounds index)', function(done) {
    var cli = require('../../..');
    cli = cli()
      .use(require('cli-mid-parser'))
      .use(1, require('cli-mid-defaults'));
    expect(cli._middleware.length).to.eql(2);
    var func = cli._middleware[1];
    var nm = func.name;
    expect(nm).to.eql('defaults');
    done();
  });
});
