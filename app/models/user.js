var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// setup and export User module from mongoose
module.exports = mongoose.model('User', new Schema({
  name: String,
  password: String,
  admin: Boolean
}));
