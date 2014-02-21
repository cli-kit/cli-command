var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));

var json = require('../../../lib/help').json;
var stringify = require('../../../lib/help').stringify;
var fields = json.fields;

function assert(o) {
  var descriptor = this.package();
  expect(o).to.be.an('object');
  expect(o.name).to.eql(this.name());
  expect(o.version).to.eql(this.version());
  expect(o.description).to.eql(this.description());
  fields.forEach(function(z) {
    if(descriptor[z]) {
      expect(o[z]).to.eql(descriptor[z]);
    }
  });
}

describe('cli-command:', function() {
  it('should convert program to json string (default indent)', function(done) {
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-string-help', 'Mock json string description');
    cli
      .version()
      .help()
      .on('complete', function(req) {
        var s = stringify.call(this, null);
        assert.call(this, JSON.parse(s));
        done();
      })
      .parse([]);
  });
  it('should convert program to json string (zero indent)', function(done) {
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-string-help', 'Mock json string description');
    cli
      .version()
      .help()
      .on('complete', function(req) {
        var s = stringify.call(this, 0);
        assert.call(this, JSON.parse(s));
        done();
      })
      .parse([]);
  });
  it('should convert program to json string (null package)', function(done) {
    var cli = require('../../..')
    cli = cli(null, 'mock-json-string-help', 'Mock json string description');
    cli
      .version()
      .help()
      .on('complete', function(req) {
        var s = stringify.call(this, 0);
        done();
      })
    cli.parse([]);
  });
  it('should convert program to json object', function(done) {
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-object-help', 'Mock json object description');
    cli
      .option('--optional [value]', 'optional option')
      .command('ls', 'list files')
      .version()
      .help()
      .on('complete', function(req) {
        var o = json.call(this);
        console.dir(o);
        assert.call(this, o);
        done();
      })
      .parse([]);
  });
})
