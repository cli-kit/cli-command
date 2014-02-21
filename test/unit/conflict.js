var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var types = require('../..').types;
var exit;

describe('cli-command:', function() {
  beforeEach(function(done) {
    exit = process.exit;
    done();
  });
  afterEach(function(done) {
    process.exit = exit;
    done();
  });
  it('should exit on property conflict (action)', function(done) {
    var cli = require('../..')(pkg, 'mock-conflict');
    var args = [];
    process.exit = function(code) {
      done();
    }
    cli.option('-a, --action [action]', 'argument property conflict')
    cli.parse(args);
  });
  it('should exit on function conflict (parse)', function(done) {
    var cli = require('../..')(pkg, 'mock-function-conflict');
    var args = [];
    process.exit = function(code) {
      done();
    }
    cli.option('-p, --parse [value]', 'function property conflict')
    cli.parse(args);
  });
  it('should exit on object group property name conflict (configuration)',
    function(done) {
      var cli = require('../..')(pkg, 'mock-object-conflict');
      var args = ['-c=file.conf'];
      process.exit = function(code) {
        done();
      }
      cli
        .option('-c, --conf <file>',
          'configuration file', types.object('configure'))
      cli.parse(args);
    }
  );
  it('should exit on log middleware conflict',
    function(done) {
      var cli = require('../..')
      process.exit = function(code) {
        done();
      }
      cli = cli(pkg, 'mock-log-conflict')
        .use(cli.middleware.logger)
        .option('-l, --log [file]', 'middleware property conflict')
        .parse(['--log']);
    }
  );
  it('should exit on environment variable merge',
    function(done) {
      process.env.mock_env_conflict_action = true;
      var conf = {env: {merge: true}};
      var cli = require('../..')(pkg, 'mock_env_conflict');
      var args = [];
      process.exit = function(code) {
        done();
      }
      cli.configure(conf)
      cli.parse(args);
    }
  );
})
