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
var PlainDocument = function() {
  HelpDocument.call(this);
  this.remove(
    HelpDocument.NAME,
    HelpDocument.DESCRIPTION,
    HelpDocument.ENVIRONMENT,
    HelpDocument.FILES,
    HelpDocument.EXAMPLES,
    HelpDocument.EXIT,
    HelpDocument.HISTORY,
    HelpDocument.AUTHOR,
    HelpDocument.BUGS,
    HelpDocument.COPYRIGHT,
    HelpDocument.SEE
  );
}

util.inherits(PlainDocument, HelpDocument);

module.exports = function() {
  return new PlainDocument();
}
module.exports.PlainDocument = PlainDocument;
module.exports.pad = pad;
module.exports.repeat = repeat;
module.exports.wrap = wrap;
module.exports.longest = longest;
