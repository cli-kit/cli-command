var fs = require('fs');

function loader(file, callback) {
  var scope = this;
  console.log('load file');
  fs.exists(file, function(exists) {
    if(!exists) return callback(scope.errors.EEXIST, [file]);
  })
}

module.exports = loader;
