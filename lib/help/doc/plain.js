var util = require('util');
var HelpDocument = require('./doc').HelpDocument;

var utils = require('cli-util');
var pad = utils.pad, repeat = utils.repeat, wrap = utils.wrap;

function longest(target, max) {
  var mx = max || 0, z;
  for(z in target) {
    mx = Math.max(mx, target[z].name().length);
  }
  return mx;
}

/**
 *  Write help as a plain text document as if it were
 *  being sent to a tty.
 */
var PlainDocument = function() {}

util.inherits(PlainDocument, HelpDocument);

module.exports = function() {
  var doc = new PlainDocument();
  return doc.write(this);
}
module.exports.PlainDocument = PlainDocument;
module.exports.pad = pad;
module.exports.repeat = repeat;
module.exports.wrap = wrap;
module.exports.longest = longest;
