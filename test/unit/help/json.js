var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));

var json = require('../../../lib/help').json;
var fields = json.fields;

describe('cli-command:', function() {
  it('should convert program to json object', function(done) {
    var cli = require('../../..')

    cli = cli(pkg, 'mock-json-help', 'Mock json description');
    cli.configure({exit: false});
    cli
      .version()
      .help()
      .on('complete', function(req) {
        var descriptor = this.package();
        var o = json.call(this);
        console.dir(o);
        expect(o).to.be.an('object');
        expect(o.name).to.eql(this.name());
        expect(o.version).to.eql(this.version());
        expect(o.description).to.eql(this.description());
        fields.forEach(function(z) {
          if(descriptor[z]) {
            expect(o[z]).to.eql(descriptor[z]);
          }
        });
        done();
      })
      .parse([]);
  });
})
