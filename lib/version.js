module.exports =  function(alive) {
  console.log(this._name + ' %s', this._version);
  if(!alive) process.exit();
}
