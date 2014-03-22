## Executable Commands

If you wish to structure your program as a series of executables for each command ([git][git] style) use the alternative syntax:

```javascript
require('ttycolor')().defaults();
var cli = require('../..')();
cli
  .version()
  .help()
  .on('empty', function(help, version) {
    help.call(this, true);
    console.error(this.name() + ': command required');
  })
  .command('install', 'install packages')
var ps = cli.parse();   // execute pkg-install(1) upon install command
```

Source: [pkg](https://github.com/freeformsystems/cli-command/tree/master/bin/example/pkg)
