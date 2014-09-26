module.exports = function conf(info, req, next){
  next(info.cmd.commands());
}
