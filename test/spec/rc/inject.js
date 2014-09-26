var path = require('path');
var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should use rc middleware with rc conf', function(done) {
    var cli = require('../../..');
    cli = cli()
      .configure({rc: {merge: false}})
      .parse([]);
    done();
  });
});
