/**
 *  The stdin middlware reads from stdin.
 *
 *  It must be configured very early on in the middleware chain preferably
 *  after error and before any other async operations such as the load
 *  middleware.
 *
 *  If configured after the load middleware the process.stdin data event never
 *  fires. Go figure.
 *
 *  This means that we cannot use the convenient stdin property exposed by the
 *  result object of the parser middleware instead we inspect argv directly
 *  for '-'.
 *
 *  Note that currently only the old streams API is supported so your program
 *  should call process.stdin.resume() as early as possible.
 *
 *  This middleware decorates the request (req) with a stdin property that
 *  contains the result of reading the input from stdin.
 */
module.exports = function() {
  var conf = this.configure();
  var args = process.argv.slice(2);
  if(!conf.stdin || !~args.indexOf('-')) return this;
  return function stdin(req, next) {
    var timeout = conf.stdin.timeout;
    if(typeof timeout !== 'number') {
      timeout = 5000;
    }
    var err = this.errors.ESTDIN_TIMEOUT;
    var timer = setTimeout(function() {
      next(err, [(timeout/1000).toFixed(2)]);
    }, timeout)

    var buf = new Buffer('');
    process.stdin.on('data', function(chunk){
      buf = Buffer.concat([buf, chunk]);
    })
    process.stdin.on('end', function() {
      req.stdin = buf;
      clearTimeout(timer);
      next();
    });
  }
}
