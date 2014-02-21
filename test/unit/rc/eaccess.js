var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should throw error on file permissions', function(done) {
    var cli = require('../../..');
    cli = cli()
      .configure({exit: false, rc: {name: 'eaccess.json', path: [__dirname]}})
      .on('error', function(e) {
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        done();
      })
      .parse([]);
  });
});
