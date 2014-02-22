var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));

var HelpDocument = require('../../../lib/help/doc/doc').HelpDocument;

describe('cli-command:', function() {
  it('should listen for help event', function(done) {
    var cli = require('../../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['-h'];
    cli
      .on('help', function(data, document) {
        expect(data).to.be.an('object');
        expect(document).to.be.an('object');
        expect(document.sections).to.be.an('array');
        expect(document.write).to.be.a('function');
        var plain = new HelpDocument();
        plain.remove('unknown');
        plain.write(this, data);
      })
      .help()
      .parse(args);
    done();
  });
})
