var Option = require('cli-define').Option;

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
 *
 *  @param conf A color configuration object.
 *  @param description The option description.
 */
module.exports = function(conf, description) {
  conf = conf || {defaults: false};
  var ttycolor = require('ttycolor');
  var name = conf.option && conf.option.always ? conf.option.always
    : ttycolor.parser.option.always;
  if(conf.defaults !== false) ttycolor(conf.option).defaults(conf.styles);
  var opt = new Option(
    name, description || 'control terminal colors');
  this.option(opt);
  return this;
}
