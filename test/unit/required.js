var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg);
var exit;

describe('cli-command:', function() {
  beforeEach(function(done) {
    exit = process.exit;
    process.exit = function(code) {return code;}
    done();
  });
  afterEach(function(done) {
    process.exit = exit;
    done();
  });
  it('should print error on missing required option', function(done) {
    var args = [];
    cli
      .option('-i, --integer <n>', 'an integer argument', parseInt)
    cli.parse(args);
    done();
  });
  it('should invoke error handler on missing required option', function(done) {
    var args = [];
    cli
      .on('error',function(e) {
        //expect(code).to.eql(codes.EREQUIRED);
        done();
      })
      .option('-i, --integer <n>', 'an integer argument', parseInt)
    cli.parse(args);
  });
})
