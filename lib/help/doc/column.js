var eol = require('os').EOL;

var utils = require('cli-util');
var pad = utils.pad, repeat = utils.repeat, wrap = utils.wrap;

var COLUMN_ALIGN = 'column';
var LINE_ALIGN = 'line';
var FLEX_ALIGN = 'flex';
var WRAP_ALIGN = 'wrap';
var align = [COLUMN_ALIGN, LINE_ALIGN, FLEX_ALIGN, WRAP_ALIGN];

function lines(value, indent) {
  // pad remaining lines
  var list = value.split('\n');
  if(list.length > 1) {
    var remainder = list.slice(1).map(function(line) {
      return indent + line;
    })
    value = list[0] + '\n' + remainder.join('\n');
  }
  return value;
}

/**
 *  Align two string values to columns.
 *
 *  @param left The value for the left column.
 *  @param right The value for the right column.
 */
module.exports = function(left, right) {
  var tmp;
  // must set primary diff before adjusting column
  var diff = this.limit - this.width;
  // account for primary leading space
  var column = this.width - this.padding;
  var lead = repeat(this.padding);
  var isColumn = this.align === COLUMN_ALIGN;
  var isLine = this.align === LINE_ALIGN;
  var flex = this.align === FLEX_ALIGN;
  var breaks = isLine || (left.length >= column && !flex);
  var rcol = this.metrics.maximum + this.space.length + this.padding;
  if(this.align === WRAP_ALIGN) {
    if(!this.wraps) {
      left = left + this.space;
    }else{
      tmp = left + this.space + right;
      tmp = wrap(tmp, 0, this.limit - this.padding);
      right = this.space + tmp.substr(left.length + this.space.length);
      right = lines(right, repeat(this.padding));
    }
  }else{
    // indent amount for description lines
    var lindent = repeat(column + this.padding);
    if(isLine) {
      diff = this.limit - this.padding * 2;
      lindent = repeat(this.padding * 2);
    }else if(flex) {
      diff = this.limit - rcol;
      lindent = repeat(rcol);
    }
    if(right && this.wraps) {
      diff = Math.max(diff, 2);
      right = wrap(right, 0, diff);
      right = lines(right, lindent);
    }
    if(right && isColumn && breaks) {
      right = lead + repeat(column) + right;
    }else if(right && isLine) {
      right = lindent + right;
    }else if(right && flex) {
      right = this.space + right;
      lead = '';
    }
    // description breaks onto newline
    if(breaks) right = '\n' + right;
    // right pad left column
    if(isColumn) {
      left = pad(left, column);
    // left pad left column in flex mode
    }else if(flex) {
      left = pad(left, rcol - this.space.length, true);
    }
  }
  return {lead: lead, left: left, right: right}
}

module.exports.lines = lines;
module.exports.align = align;
module.exports.COLUMN_ALIGN = COLUMN_ALIGN;
module.exports.LINE_ALIGN = LINE_ALIGN;
module.exports.FLEX_ALIGN = FLEX_ALIGN;
module.exports.WRAP_ALIGN = WRAP_ALIGN;
