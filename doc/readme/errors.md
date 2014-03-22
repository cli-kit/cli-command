## Errors

Handling errors in any program is important but doing it elegantly in a command line program can be tricky, so the [error] module has been integrated to make error handling consistent and robust.

The pre-defined error conditions are in [en.json][en.json]. The [error][error] module intentionally starts incrementing exit status codes from `128` so as not to conflict with low exit status codes, for example, `node` uses exit code `8` to indicate an uncaught exception. The command module uses exit codes from `64-127` and you are encouraged to start your exit codes from `128`.

Error conditions encountered by the module are treated in an idiomatic manner, they are dispatched as an `error` event from the program. However, you may just want some default error handling, so if you have not registered an `error` listener on the program by the time `parse()` is called then the default error handling will be used.

The default error handling prints useful messages to `stderr` with information about the error except for an uncaught exception which will also print the stack trace.

```javascript
var path = require('path');
require('ttycolor')().defaults();
var pkg = path.normalize(
  path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg, 'error/custom');
cli
  .on('error', function(e) {
    // map of error definitions is `this.errors`
    if(e.code == this.errors.EUNCAUGHT.code) {
      e.error(false); // omit stack trace
      e.exit();       // use error definition exit code
    }
    // pass other errors through to the default handler
    this.error(e);
  })
  .option('-n, --number [n]', 'a numeric value', Number)
  .version()
  .help()
  .parse();
throw new Error('a custom error message');
```

Source: [error/custom][error/custom]

If you are only interested in a particular error you can listen for the error event by error definition `key` (note the event name is lowercase). When you listen for a particular error the generic `error` event is not dispatched for that error condition.

```javascript
var path = require('path');
require('ttycolor')().defaults();
var pkg = path.normalize(
  path.join(__dirname, '..', '..', 'package.json'));
var cli = require('../..')(pkg, 'error/event');
cli
  .on('etype', function(e) {
    console.error(this.name() + ': %s', 'etype listener fired');
    // NOTE: if we did not invoke the default handler
    // NOTE: which exits the process on error by default
    // NOTE: then the default uncaught exception handling
    // NOTE: would also be triggered
    this.error(e);
  })
  .option('-n, --number [n]', 'a numeric value', Number)
  .version()
  .help()
  .parse();
throw new Error('an euncaught listener error message');
```

Source: [error/event][error/event]
