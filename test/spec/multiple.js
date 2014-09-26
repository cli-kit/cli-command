var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should print error on multiple args', function(done) {
    var cli = require('../..')(pkg);
    cli.configure({exit:false});
    var args = ['-i', '10', '--integer', '20'];
    cli
      .on('error', function(e) {
        expect(e.code).to.eql(this.errors.EMULTIPLE.code);
        done();
      })
      .option('-i, --integer <n>', 'an integer argument', parseInt)
    cli.parse(args);
  });
  it('should be array on single argument', function(done) {
    var cli = require('../..')(pkg);
    cli.configure({exit:false});
    var args = ['-i', '10'];
    cli
      .option('-i, --integer <n...>', 'an integer argument', parseInt)
    cli.parse(args);
    expect(cli.integer).to.eql([10]);
    done();
  });
  it('should be array on multiple arguments', function(done) {
    var cli = require('../..')(pkg);
    cli.configure({exit:false});
    var args = ['-i', '10', '--integer=20'];
    cli
      .option('-i, --integer <n> ...', 'an integer argument', parseInt)
    cli.parse(args);
    expect(cli.integer).to.eql([10, 20]);
    done();
  });
  it('should be empty array on zero arguments', function(done) {
    var cli = require('../..')(pkg);
    cli.configure({exit:false});
    var args = [];
    cli
      .option('-i, --integer [n...]', 'an integer argument', parseInt)
    cli.parse(args);
    expect(cli.integer).to.eql([]);
    done();
  });
})
