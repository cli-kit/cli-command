var Option = require('cli-define').Option;
var types = require('../types');

/**
 *  Initialize ansi color support and add options
 *  that correspond to the ttycolor options.
 *
 *  The color configuration supports:
 *
 *  - defaults: Boolean indicating default styles should be initialized.
 *  - option: Object defining the option: {always: '--color', never:
 *  '--no-color'}
 *  - styles: Custom styles to pass when initializing the module.
 *  - validate: A boolean indicating that the option should use enum
 *  validation for the available values, not that specifying this will
 *  disable support for --no-color.
 *
 *  @param conf A color configuration object.
 *  @param description The option description.
 */
module.exports = function(conf, description) {
  conf = conf || {defaults: false, validate: true};
  //console.dir(conf);
  var ttycolor = require('ttycolor');
  var list = Object.keys(ttycolor.parser.modes);
  //list.push(false);   // allow --no-color
  var name = conf.option && conf.option.always ? conf.option.always
    : ttycolor.parser.option.always;
  if(conf.defaults !== false) ttycolor(conf.option).defaults(conf.styles);
  var opt = new Option(
    name, description || 'control terminal color',
    conf.validate ? types.enum(list) : null);
  if(conf.validate) opt.value(ttycolor.parser.auto);
  this.option(opt);
  return this;
}
