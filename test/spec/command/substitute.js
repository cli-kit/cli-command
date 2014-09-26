var path = require('path');
var expect = require('chai').expect;
var pkg = path.normalize(
  path.join(__dirname, '..', '..', '..', 'package.json'));
var file = path.join(
  __dirname, path.basename(__filename).replace(/\.js$/, '') + '.md')
var Command = require('cli-define').Command;

describe('cli-command:', function() {
  it('should load command definition', function(done) {
    var cli = require('../../..');
    var options = {};
    var name = 'mock-substitute-definition';
    var description = 'Mock description for ' + name + '.';
    cli(pkg, name)
      .configure({
        load: {file: file, options: options},
        substitute: {enabled: true}
      })
      .on('substitute', function() {
        expect(this.name()).to.eql(name);
        expect('' + this.description()).to.eql(description);
        done();
      })
      .parse([]);
  });
})
