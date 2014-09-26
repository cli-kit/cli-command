var path = require('path');
var expect = require('chai').expect;
var error = require('cli-system').exec.error;
describe('cli-command:', function() {
  it('should raise error (EACCES)', function(done) {
    var cli = require('../../..');
    cli = cli(null, 'middleware/exec');
    cli.on('error', function(e) {
      done();
    })
    error(cli, {code: 'EACCES'});
  });
  it('should ignore unknown error (EUNKNOWN)', function(done) {
    var cli = require('../../..');
    cli = cli(null, 'middleware/exec');
    error(cli, {code: 'EUNKNOWN'});
    done();
  });
});
