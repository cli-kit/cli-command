var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));
describe('cli-command:', function() {
  it('should throw error on invalid middleware', function(done) {
    var cli = require('../..')(pkg);
    function fn() {
      cli.use();
    }
    expect(fn).throws(Error);
    expect(fn).throws(/^Invalid middleware/);
    done();
  });
})
