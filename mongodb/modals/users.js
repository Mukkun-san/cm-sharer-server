let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  guid: String,
  username: String,
  email: String,
  picture: String,
  state: String,
  downloads: Number,
  joinedOn: Date,
});

module.exports = mongoose.model("User", userSchema);
