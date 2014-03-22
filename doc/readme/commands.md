## Commands

```javascript
var path = require('path');
require('ttycolor')().defaults();
// use existing meta data (package.json)
var cli = require('../..')(
  path.join(__dirname, '..', 'package.json'));
cli
  .option('-f --file <file...>', 'files to copy')
  .option('-v --verbose', 'print more information')
  .version()
  .help();
cli.command('cp')
  .description('copy files')
  .action(function(cmd, options, raw) {
    // execute copy logic here, scope is the program instance (cli)
    console.log('files: %j', this.file);
  });
cli.parse();  // defaults to process.argv.slice(2)
```

Source: [command](https://github.com/freeformsystems/cli-command/tree/master/ebin/example/command)
