var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
describe('cli-command:', function() {
  it('should throw error on invalid middleware', function(done) {
    var cli = require('../../..')(pkg);
    function fn() {
      cli.use(null);
    }
    expect(fn).throws(Error);
    expect(fn).throws(/^Invalid middleware/);
    done();
  });

  it('should throw error on duplicate middleware', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli(pkg);
    cli.use(middleware.error);
    function fn() {
      cli.use(middleware.error);
    }
    expect(fn).throws(Error);
    expect(fn).throws(/^Invalid middleware/);
    done();
  });
  it('should subtract middleware from default middleware', function(done) {
    var cli = require('../../..');
    var env = cli.middleware.env;
    var middleware = cli.middleware;
    var conf = {middleware: {env: false}};
    var prg = cli(pkg).use();
    var len = prg._middleware.length;
    cli = cli(pkg)
      .configure(conf).use();
    expect(cli._middleware.length).to.eql(len - 1);
    done();
  });
  it('should use custom middleware', function(done) {
    var argv = process.argv.slice(0);
    process.argv = process.argv.slice(0, 2);
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli(pkg)
      .use(middleware.error)
      .use(middleware.parser)
      .parse();
    // NOTE: the error middleware does not return a function
    // NOTE: therefore does not become part of the middleware execution chain
    expect(cli._middleware.length).to.eql(1);
    process.argv = argv;
    done();
  });
  it('should do nothing with no configured middleware', function(done) {
    var cli = require('../../..');
    cli = cli(pkg)
      .use(false)
      .parse();
    expect(cli._middleware.length).to.eql(0);
    done();
  });
})
