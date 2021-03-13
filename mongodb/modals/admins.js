let mongoose = require("mongoose");

let adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String,
  addedOn: Date,
});

module.exports = mongoose.model("Admin", adminSchema);
