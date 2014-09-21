var prefix = 'notify:';

/**
 *  Asynchronous notification of options.
 *
 *  The events middleware is useful for quick actions such as setting a
 *  property or calling a method when an option is encountered however it
 *  is not asynchronous so the flow control cannot be controlled.
 *
 *  This middleware invokes event listeners passing a next() callback function
 *  so that they may do asynchronous validation of options.
 *
 *  Event names are prefixed with `notify:` followed by the key for the option.
 *
 *  Signature for event listeners is:
 *
 *  function(req, next, arg, value)
 *
 *  They must invoke next() and it passes it's arguments to the main
 *  middleware next() callback function.
 */
module.exports = function() {
  var conf = this.configure();
  if(conf.notify === false) return this;
  return function notify(req, next) {
    var bail = conf.notify && conf.notify.bail === true;
    var z, arg, j, list = [], name;
    for(z in req.result.all) {
      arg = this._options[z];
      if(arg) {
        name = arg.key();
        name = prefix + name;
        listeners = this.listeners(name);
        if(listeners.length) {
          for(j = 0;j < listeners.length;j++) {
            list.push(
              {
                listener: listeners[j],
                name: name,
                arg: arg,
                value: req.result.all[z],
                key: z
              }
            );
          }
        }
      }
    }

    var i = 0, scope = this;
    function complete() {
      next.apply(scope, arguments);
    }

    function exec() {
      var data = list[i]
        , listener = data.listener
        , name = data.name
        , arg = data.arg
        , value = data.value;
      scope.emit(name, req, nextevent, arg, value);
    }

    function nextevent() {
      if(bail && arguments.length) {
        return complete.apply(scope, arguments);
      }
      i++;
      if(i < list.length) {
        exec();
      }else{
        return complete.apply(scope, arguments);
      }
    }
    if(list.length) {
      exec();
    }else{
      next();
    }
  }
}
module.exports.prefix = prefix;
