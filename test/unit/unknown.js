var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should error on unknown option (strict mode)', function(done) {
    var cli = require('../..')(pkg);
    var args = ['unknown value'];
    cli.configure({strict: true})
      .on('error', function(e) {
        expect(e.code).to.eql(this.errors.EUNKNOWN.code);
        done();
      })
      .parse(args);
  });
})
