var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should use custom env configuration', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    var conf = {};
    cli = cli(null, 'middleware/env')
      .configure({env: {prefix: 'env_', match: /^env_/}});
    expect(cli.configure().env.prefix).to.eql('env_');
    expect(cli.configure().env.match).to.eql(/^env_/);
    cli.parse([]);
    done();
  });
});
