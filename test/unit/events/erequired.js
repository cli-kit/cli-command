var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
describe('cli-command:', function() {
  it('should listen for erequired event', function(done) {
    var cli = require('../../..')(pkg);
    cli.configuration({exit:false});
    var args = [];
    cli
      .on('erequired',function(e, errors) {
        expect(e.code).to.eql(errors.EREQUIRED.code);
        done();
      })
      .option('-i, --integer <n>', 'an integer argument', parseInt)
    cli.parse(args);
  });
})
