var expect = require('chai').expect;
describe('cli-command:', function() {
  it('should override environment variable', function(done) {
    process.env.mock_variable = 'value';
    process.env.mock_prefix = '/usr/local/etc/env';
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .configure({
          exit: false,
          rc: {name: 'rc.json', path: [__dirname]},
          env: {merge: true, prefix: 'mock'}})
      .on('complete', function(req) {
        expect(this.variable).to.eql(req.env.variable)
          .to.eql('value');
        expect(req.env.prefix).to.eql('/usr/local/etc/env');
        expect(req.rc).to.be.an('object');
        expect(req.rc.prefix).to.be.a('string');
        expect(this.prefix).to.eql(req.rc.prefix);
        done();
      })
      .parse([]);
  });
  it('should override environment and rc with argument', function(done) {
    process.env.mock_prefix = '/usr/local/etc/env';
    var cli = require('../../..');
    var middleware = cli.middleware;
    cli = cli()
      .configure({
          exit: false,
          rc: {name: 'rc.json', path: [__dirname]},
          env: {merge: true, prefix: 'mock'}})
      .option('--prefix [dir]', 'a directory prefix')
      .on('complete', function(req) {
        expect(req.env.prefix).to.eql('/usr/local/etc/env');
        expect(req.rc.prefix).to.eql('/usr/local/etc/rc');
        expect(this.prefix).to.eql('/usr/local/etc/arg');
        done();
      })
      .parse(['--prefix=/usr/local/etc/arg']);
  });
});
