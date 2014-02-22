var expect = require('chai').expect;

var JsonDocument = require('../../../lib/help/doc').json.JsonDocument;
var GnuDocument = require('../../../lib/help/doc').gnu.GnuDocument;

describe('cli-command:', function() {
  it('should use json document', function(done) {
    var cli = require('../../..')(null, 'mock-help-style');
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
    var cli = require('../../..')(null, 'mock-help-style');
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
  it('should use gnu document (invalid style)', function(done) {
    var cli = require('../../..')(null, 'mock-help-style');
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
