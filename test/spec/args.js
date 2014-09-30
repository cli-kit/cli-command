var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(path.join(__dirname, '..', '..', 'package.json'));

describe('cli-command:', function() {
  it('should access empty args via request', function(done) {
    var cli = require('../..')(pkg);
    var args = [];
    cli.parse(args, function onparse(req) {
      expect(req.args).to.eql([]);
      done();
    });
  });
  it('should access args via request', function(done) {
    var cli = require('../..')(pkg);
    var args = ['file.txt', 'file.json'];
    cli.parse(args, function onparse(req) {
      expect(req.args).to.eql(['file.txt', 'file.json']);
      done();
    });
  });
})
