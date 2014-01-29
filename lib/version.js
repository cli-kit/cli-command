module.exports =  function() {
  console.log(this._name + ' %s', this._version);
  process.exit();
}
