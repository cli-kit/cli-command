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
  //console.dir(this.description());
  //console.dir(o.description);
  //expect(o.description).to.eql(this.description());
  fields.forEach(function(z) {
    if(descriptor[z]) {
      expect(o[z]).to.eql(descriptor[z]);
    }
  });
}

describe('cli-command:', function() {
  it('should print json help', function(done) {
    var method = process.stdout.write;
    process.stdout.write = function(){}
    process.env.CLI_TOOLKIT_HELP_JSON=1;
    process.env.CLI_TOOLKIT_HELP_JSON_INDENT = 2;
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-string-help', 'Mock json string description');
    cli
      .configure({exit: false})
      .version()
      .help()
      .on('complete', function(req) {
        process.stdout.write = method;
        delete process.env.CLI_TOOLKIT_HELP_JSON;
        delete process.env.CLI_TOOLKIT_HELP_JSON_INDENT;
        done();
      })
      .parse(['--help']);
  });
  it('should print json help (no indent)', function(done) {
    var method = process.stdout.write;
    process.stdout.write = function(){}
    //process.stdout.write = function(str){console.error(str)}
    process.env.CLI_TOOLKIT_HELP_JSON=1;
    delete process.env.CLI_TOOLKIT_HELP_JSON_INDENT;
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-string-help', 'Mock json string description');
    cli
      .configure({exit: false})
      .version()
      .help()
      .on('complete', function(req) {
        process.stdout.write = method;
        delete process.env.CLI_TOOLKIT_HELP_JSON;
        done();
      })
      .parse(['--help']);
  });
  it('should print json help (invalid indent)', function(done) {
    var method = process.stdout.write;
    process.stdout.write = function(){}
    process.env.CLI_TOOLKIT_HELP_JSON=1;
    process.env.CLI_TOOLKIT_HELP_JSON_INDENT='invalid';
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-string-help', 'Mock json string description');
    cli
      .configure({exit: false})
      .version()
      .help()
      .on('complete', function(req) {
        process.stdout.write = method;
        delete process.env.CLI_TOOLKIT_HELP_JSON;
        delete process.env.CLI_TOOLKIT_HELP_JSON_INDENT;
        done();
      })
      .parse(['--help']);
  });
  it('should not print json help (CLI_TOOLKIT_HELP2MAN)', function(done) {
    process.env.CLI_TOOLKIT_HELP2MAN=1;
    var method = process.stdout.write;
    process.stdout.write = function(){}
    process.env.CLI_TOOLKIT_HELP_JSON=1;
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-string-help', 'Mock json string description');
    cli
      .configure({exit: false})
      .version()
      .help()
      .on('complete', function(req) {
        process.stdout.write = method;
        delete process.env.CLI_TOOLKIT_HELP_JSON;
        delete process.env.CLI_TOOLKIT_HELP2MAN;
        done();
      })
      .parse(['--help']);
  });
  it('should convert program to json string (default indent)', function(done) {
    var cli = require('../../..')
    cli = cli(pkg, 'mock-json-string-help', 'Mock json string description');
    cli
      .configure({exit: false})
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
      .configure({exit: false})
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
      .configure({exit: false})
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
      .configure({exit: false})
      .option('--optional [value]', 'optional option')
      .command('ls', 'list files')
      .version()
      .help()
      .on('complete', function(req) {
        var o = json.call(this);
        //console.dir(o);
        assert.call(this, o);
        done();
      })
      .parse([]);
  });
})
