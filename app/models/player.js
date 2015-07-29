var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
  name: String,
  posted: Date,
  level: Number,
  ccp: Number
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;
