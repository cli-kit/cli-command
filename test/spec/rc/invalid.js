var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should throw error on invalid json', function(done) {
    var cli = require('../../..');
    cli = cli()
      .configure({exit: false, rc: {name: 'invalid.json', path: [__dirname]}})
      .on('error', function(e) {
        expect(e.cause()).to.be.instanceof(SyntaxError);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        done();
      })
      .parse([]);
  });
});
