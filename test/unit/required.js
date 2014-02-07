var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should print error on missing required option', function(done) {
    var cli = require('../..')(pkg);
    cli.configuration({exit: false});
    var args = [];
    cli
      .option('-i, --integer <n>', 'an integer argument', parseInt)
    cli.parse(args);
    done();
  });
  it('should invoke error handler on missing required option', function(done) {
    var cli = require('../..')(pkg);
    cli.configuration({exit: false});
    var args = [];
    cli
      .on('error',function(e) {
        expect(e.code).to.eql(this.errors.EREQUIRED.code);
        done();
      })
      .option('-i, --integer <n>', 'an integer argument', parseInt)
    cli.parse(args);
  });
})
