var Option = require('cli-define').Option;

/**
 *  Initialize ansi color support and add options
 *  that correspond to the ttycolor options.
 *
 *  @param conf A configuration to pass to ttycolor.
 *  @param description The option description.
 */
module.exports = function(conf, description) {
  conf = conf || {};
  var ttycolor = require('ttycolor');
  var name = conf.option && conf.option.always ? conf.option.always
    : ttycolor.parser.option.always;
  if(conf.defaults !== false) ttycolor(conf.option).defaults(conf.styles);
  var opt = new Option(
    name, description || 'control terminal colors');
  opt.key('coloropt');
  this.option(opt);
  return this;
}
