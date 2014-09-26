var Flag = require('cli-define').Flag;
var types = require('cli-types');

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
 *  - stderr Redirect all messages to the stderr stream, default is true.
 *
 *  @param conf A color configuration object.
 *  @param description The option description.
 */
module.exports = function(conf, name, description, stderr) {
  conf = conf || {};
  var serr = true;
  for(var i = 1;i < arguments.length;i++) {
    if(typeof arguments[i] === 'boolean') {
      serr = arguments[i];
      break;
    }
  }
  //console.dir(conf);
  var ttycolor = require('ttycolor');
  var list = Object.keys(ttycolor.parser.modes);
  //list.push(false);   // allow --no-color
  //var name = conf.option && conf.option.always ? conf.option.always
    //: ttycolor.parser.option.always;
  name = name || '--[no]-color';
  if(conf.defaults !== false) {
    // disable options parser
    ttycolor.revert = ttycolor(false, false).defaults(conf.styles, serr);

    // this is far from ideal but this is the only way
    // currently to allow the logger console stream to detect
    // whether ttycolor has been initialized
    global.ttycolor = ttycolor;
  }
  this.on('color', function oncolor(req, arg, value) {
    ttycolor.mode = (value === false)
      ? ttycolor.parser.never : ttycolor.parser.auto;
  })
  var opt = new Flag(
    name, description || 'enable or disable terminal colors',
    conf.validate ? types.enum(list) : null);
  if(conf.validate) opt.value(ttycolor.parser.auto);
  this.option(opt);
  return this;
}
