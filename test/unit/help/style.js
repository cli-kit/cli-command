var expect = require('chai').expect;

var docs = require('../../../lib/help/doc');
var JsonDocument = docs.json.JsonDocument;
var GnuDocument = docs.gnu.GnuDocument;
var SynopsisDocument = docs.synopsis.SynopsisDocument;

describe('cli-command:', function() {
  it('should use json document', function(done) {
    var cli = require('../../..')(null, 'mock-help-style-json');
    cli.configure({exit: false, help: {style: 'json'}});
    var args = ['-h'];
    cli
      .on('help', function(data, document) {
        expect(document).to.be.instanceof(JsonDocument);
        done();
      })
      .help()
      .parse(args);
  });
  it('should use gnu document', function(done) {
    var cli = require('../../..')(null, 'mock-help-style-gnu');
    cli.configure({exit: false, help: {style: 'gnu'}});
    var args = ['-h'];
    cli
      .on('help', function(data, document) {
        expect(document).to.be.instanceof(GnuDocument);
        done();
      })
      .help()
      .parse(args);
  });
  it('should use synopsis document', function(done) {
    var cli = require('../../..')(null, 'mock-help-style-synopsis');
    cli.configure({exit: false, help: {style: 'synopsis'}});
    var args = ['-h'];
    cli
      .on('help', function(data, document) {
        expect(document).to.be.instanceof(SynopsisDocument);
        done();
      })
      .help()
      .parse(args);
  });
  it('should use gnu document (invalid style)', function(done) {
    var cli = require('../../..')(null, 'mock-help-style-invalid');
    cli.configure({exit: false, help: {style: 'invalid'}});
    var args = ['-h'];
    cli
      .on('help', function(data, document) {
        expect(document).to.be.instanceof(GnuDocument);
        done();
      })
      .help()
      .parse(args);
  });
})
