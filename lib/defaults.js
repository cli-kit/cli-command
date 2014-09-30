var defaults = {
  // mark this program as an interactive REPL
  // console, use this flag to modify program
  // behaviour when running interactively
  interactive: false,
  parser: {
    // map be a function, gets passed the parser configuration
    // and should modify it in place
    configure: null
  },
  //load: {
    //file: null,
    //options: null
  //},
  //substitute: {
    //escaping: true,
    //enabled: false
  //},
  command: {
    exec: false,
    dir: null
  },
  exit: process.env.NODE_ENV !== 'test',
  bail: process.env.NODE_ENV === 'test',
  stash: null,
  bin: null,
  env: null,
  synopsis: {
    options: true,
    commands: true
  },
  help: {
    indent: 1,
    exit: false,
    pedantic: true,
    vanilla: false,
    sort: false,
    maximum: 80,
    width: 20,
    align: 'column',
    collapse: false,
    messages: {
      summary: 'Command should be one of: %s',
      cmd: 'where <command> is one of:\n',
      usage: {
        command: 'command',
        option: 'option',
        args: 'args'
      },
      bugs: 'Report bugs to %s.'
    },
    name: '--help',
    description: 'display this help and exit',
    action: null
  },
  trace: process.env.NODE_ENV === 'test',
  unknown: true,
  strict: false,
  middleware: null,
  // logger middleware configuration
  log: null,

  // error handling configuration
  // declare a locales property to merge
  // custom error definitions with the default
  // error definitions
  error: {
    // if a logger is available, send errors to the log
    log: {
      // print errors
      print: true
    },
    intercept: null
  },
  // programs may maintain a list of errors encountered
  errors: null,
  manual: null,
  // property name conflict detection enabled by default
  // should typically remain enabled, however for interactive
  // programs that may parse() multiple times this allows it
  conflict: true
}

module.exports = defaults;
