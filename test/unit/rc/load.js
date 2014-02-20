var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should load rc file', function(done) {
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .configure({exit: false, rc: {name: 'rc.json', path: [__dirname]}})
      .on('complete', function(req) {
        expect(req.rc).to.be.an('object');
        expect(req.rc.prefix).to.be.a('string');
        expect(this.prefix).to.eql(req.rc.prefix);
        done();
      })
      .parse([]);
  });
});
