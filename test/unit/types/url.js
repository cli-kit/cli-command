var path = require('path');
var url = require('url');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', '..', 'package.json'));
var cli = require('../../..')(pkg);
var types = require('../../..').types;

describe('cli-command:', function() {
  it('should coerce single value to url', function(done) {
    var u = 'http://nodejs.org';
    var expected = url.parse(u, true, true);
    var args = ['-u', u];
    cli
      .option('-u, --url <url>', 'a url argument', types.url)
      .parse(args);
    expect(cli.url).to.be.an('object').that.eqls(expected);
    done();
  });
  it('should coerce scheme less url', function(done) {
    var u = '//nodejs.org?page=10';
    var expected = url.parse(u, true, true);
    var args = ['-u', u];
    cli
      .option('-u, --url <url>', 'a url argument', types.url)
      .parse(args);
    expect(cli.url).to.be.an('object').that.eqls(expected);
    done();
  });
  it('should coerce multiple urls', function(done) {
    var u = '//nodejs.org#about';
    var expected = url.parse(u, true, true);
    var args = ['-u', u, '--url=' + u];
    cli
      .option('-u, --url <url...>', 'a url argument', types.url)
      .parse(args);
    expect(cli.url).to.eql([expected, expected]);
    done();
  });
  it('should error on invalid url', function(done) {
    var args = ['-u', '/page#about'];
    cli
      .error(function(code, codes, message, parameters, data) {
        expect(cli).to.eql(this);
        expect(code).to.eql(codes.ETYPE);
        //parameters.unshift(message);
        //console.error.apply(null, parameters);
        done();
      })
      .option('-u, --url <url>', 'a url argument', types.url)
    cli.parse(args);
  });
})
