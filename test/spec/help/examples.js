var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should set examples section (string)', function(done) {
    var args = ['--help'];
    var cli = require('../../..')(null, 'mock-examples-help');
    var examples = 'An example string value';
    cli.configure({exit: false, help: {sections:{examples: examples}}});
    cli.help().parse(args);
    done();
  });
  it('should set examples section (false)', function(done) {
    var args = ['--help'];
    var cli = require('../../..')(null, 'mock-examples-help');
    cli.configure({exit: false, help: {sections:{examples: false}}});
    cli.help().parse(args);
    done();
  });
  it('should set examples section (array)', function(done) {
    var args = ['--help'];
    var examples = [
      {
        name: 'mock-cmd',
        description: 'A mock examples description'
      },
      {
        name: 'mock-cmd-that-is-really-long-without-description'
      },
      {
        name: 'mock-cmd-that-is-really-long',
        description: 'A mock examples description'
      },
      {
        invalid: 'mock-cmd',
        description: 'A mock invalid example (will be ignored)'
      }
    ]
    var cli = require('../../..')(null, 'mock-examples-help');
    cli.configure({exit: false, help: {sections:{examples: examples}}});
    cli.option('-a, --another=[value]', 'another option');
    cli.help().parse(args);
    done();
  });
})
