var fs = require('fs');

function loader(file, def, callback) {
  var scope = this;
  fs.exists(file, function(exists) {
    if(!exists) return callback(scope.errors.EEXIST, [file]);
    fs.readFile(file, function(err, contents) {
      if(err) return callback(err);
      contents = '' + contents;
      console.dir(contents);
    })
  })
}

module.exports = loader;
