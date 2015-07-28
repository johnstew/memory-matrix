var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
  name: String,
  posted: Date,
  level: String,
  ccp: String
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;
