var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));

var json = require('../../../lib/help').json;

describe('cli-command:', function() {
  it('should convert program to json object', function(done) {
    var cli = require('../../..')

    cli = cli(pkg, 'mock-json-help', 'Mock json description');
    cli.configure({exit: false});
    cli
      .version()
      .help()
      .on('complete', function(req) {
        var o = json.call(this);
        expect(o).to.be.an('object');
        expect(o.name).to.eql(this.name());
        expect(o.description).to.eql(this.description());
        done();
      })
      .parse([]);
  });
})
