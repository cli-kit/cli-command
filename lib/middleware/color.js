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
module.exports = function(conf, name, description) {
  conf = conf || {};
  //console.dir(conf);
  var ttycolor = require('ttycolor');
  var list = Object.keys(ttycolor.parser.modes);
  //list.push(false);   // allow --no-color
  //var name = conf.option && conf.option.always ? conf.option.always
    //: ttycolor.parser.option.always;
  name = name || '--[no]-color';
  if(conf.defaults !== false) {
    ttycolor.revert = ttycolor(conf.option).defaults(conf.styles);

    // this is far from ideal but this is the only way
    // currently to allow the logger console stream to detect
    // whether ttycolor has been initialized
    global.ttycolor = ttycolor;
  }
  var opt = new Option(
    name, description || 'enable or disable terminal colors',
    conf.validate ? types.enum(list) : null);
  if(conf.validate) opt.value(ttycolor.parser.auto);
  this.option(opt);
  return this;
}
