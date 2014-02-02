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
  it('should print error on multiple args', function(done) {
    var args = ['-i', '10', '--integer', '20'];
    cli
      .on('error', function(e) {
        //expect(code).to.eql(codes.EMULTIPLE);
        done();
      })
      .option('-i, --integer <n>', 'an integer argument', parseInt)
    cli.parse(args);
  });
  it('should be array on single argument', function(done) {
    var args = ['-i', '10'];
    cli
      .option('-i, --integer <n...>', 'an integer argument', parseInt)
    cli.parse(args);
    expect(cli.integer).to.eql([10]);
    done();
  });
  it('should be array on multiple arguments', function(done) {
    var args = ['-i', '10', '--integer=20'];
    cli
      .option('-i, --integer <n> ...', 'an integer argument', parseInt)
    cli.parse(args);
    expect(cli.integer).to.eql([10, 20]);
    done();
  });
})
