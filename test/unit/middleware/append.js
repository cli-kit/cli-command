var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should append middleware (negative index)', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.parser)
      .use(-1, middleware.defaults);
    expect(cli._middleware.length).to.eql(2);
    var func = cli._middleware[1];
    var nm = new func().constructor.name;
    expect(nm).to.eql('defaults');
    done();
  });
  it('should append middleware (out of bounds index)', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .use(middleware.parser)
      .use(1, middleware.defaults);
    expect(cli._middleware.length).to.eql(2);
    var func = cli._middleware[1];
    var nm = new func().constructor.name;
    expect(nm).to.eql('defaults');
    done();
  });
});
