var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));

var HelpDocument = require('../../../lib/help/doc/doc').HelpDocument;

var file = path.normalize(
  path.join(__dirname, '..', '..', '..', 'log', 'help-stream-test.log'));

describe('cli-command:', function() {
  it('should listen for help event', function(done) {
    var cli = require('../../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['--help'];
    cli
      .on('help', function(data, document) {
        expect(data).to.be.an('object');
        expect(document).to.be.an('object');
        expect(document.sections).to.be.an('array');
        expect(document.write).to.be.a('function');
        document.header.call(this, null);
        document.header.call(
          this, 'Arguments:', data, process.stdout, document);
        var plain = new HelpDocument();
        plain.remove('unknown');
        plain.write(this, data);
        plain.options = function(data, stream, doc) {
          return 'Header'
        }
        plain.write(this, data);
        done();
      })
      .help()
      .parse(args);
  });
  it('should write to file stream', function(done) {
    var cli = require('../../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['--help'];
    cli
      .on('help', function(data, document) {
        document.write(
          this, data,
          fs.createWriteStream(file, {flags: 'w', encoding: 'utf8'}));
        done();
      })
      .help()
      .parse(args);
  });
  it('should write to stderr stream', function(done) {
    var method = console.error;
    console.error = function(){}
    var cli = require('../../..')(pkg, 'mock-help');
    cli.configure({exit: false});
    var args = ['--help'];
    cli
      .on('help', function(data, document) {
        document.write(this, data, process.stderr);
        console.error = method;
        done();
      })
      .help()
      .parse(args);
  });
  it('should customize examples section', function(done) {
    var cli = require('../../..')(pkg, 'mock-help-examples');
    cli.configure({exit: false});
    var args = ['--help'];
    cli
      .on('help', function(data, document, stream) {
        data.sections = data.sections || {};
        data.sections.examples = "Show help:\n\nmock-help-examples -h";
        var str = document.indent.call(
          this, data.sections.examples, 2, data, stream, document);
        document.sections.push(Object.keys(data.sections));
        document.write(this, data, stream);
        done();
      })
      .help()
      .parse(args);
  });
})
