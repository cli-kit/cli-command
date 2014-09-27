var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var types = require('../../..').types;

describe('cli-command:', function() {

  it('should group arguments into object', function(done) {
    var cli = require('../../..')(pkg);
    var scheme = 'http';
    var host = 'nodejs.org';
    var port = '80';
    var args = ['-s', scheme, '-h', host, '--port=' + port];
    cli
      .option('-s, --scheme <scheme>',
        'transport scheme', types.object('server'))
      .option('-h, --host <host>',
        'server hostname', types.object('server'))
      .option('-p, --port <n>',
        'server port', types.object('server'))
    cli.parse(args);
    expect(cli.server).to.eql({scheme: scheme, host: host, port: port });
    done();
  });

  it('should group arguments into object (nested array)', function(done) {
    var cli = require('../../..')(pkg);
    var scheme = 'http';
    var node = 'nodejs.org';
    var npm = 'npmjs.org';
    var port = '80';
    var args = ['-s', scheme, '-h', node, '--host=' + npm, '--port=' + port];
    cli
      .option('-s, --scheme <scheme>',
        'transport scheme', types.object('server'))
      .option('-h, --host <host...>',
        'server hostname', types.object('server'))
      .option('-p, --port <n>',
        'server port', types.object('server'))
    cli.parse(args);
    expect(cli.server).to.eql({scheme: scheme, host: [node, npm], port: port });
    done();
  });
})
