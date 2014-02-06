var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should import program specific environment variables',
    function(done) {
      // consider the flow
      // 1) verbose flag is set to false by default
      // 2) environment variable preference sets verbose to true
      // 3) Long flag negation switches off verbose
      process.env.env_verbose = true;
      var conf = {env: {merge: true}};
      var cli = require('../..')(pkg, 'env');
      var args = ['--no-verbose'];
      cli
        .configuration(conf)
        .option('-v --verbose', 'print more information')
        .parse(args);
      expect(cli.verbose).to.eql(false);
      done();
    }
  );
  it('should use environment variable value',
    function(done) {
      process.env.env_url = 'http://nodejs.org';
      var conf = {env: {merge: true}};
      var cli = require('../..')(pkg, 'env');
      var args = [];
      cli
        .configuration(conf)
        .parse(args);
      expect(cli.url).to.eql(process.env.env_url);
      done();
    }
  );
  it('should override environment variable value with option (merge all)',
    function(done) {
      var rc = '/usr/local/etc/envrc';
      process.env.env_url = 'http://nodejs.org';
      process.env.env_rc = rc;
      var value = 'http://npmjs.org';
      var conf = {env: {merge: true}};
      var cli = require('../..')(pkg, 'env');
      var args = ['--url=' + value];
      cli
        .configuration(conf)
        .option('-u --url [url]', 'a url')
        .parse(args);
      expect(cli.url).to.eql(value);
      expect(cli.rc).to.eql(rc);
      done();
    }
  );
  it('should override environment variable value with option (merge args)',
    function(done) {
      var rc = '/usr/local/etc/envrc';
      process.env.env_url = 'http://nodejs.org';
      process.env.env_rc = rc;
      var value = 'http://npmjs.org';
      var conf = {env: {merge: 'options'}};
      var cli = require('../..')(pkg, 'env');
      var args = ['--url=' + value];
      cli
        .configuration(conf)
        .option('-u --url [url]', 'a url')
        .parse(args);
      expect(cli.url).to.eql(value);
      expect(cli.rc).to.eql(undefined);
      done();
    }
  );
})
