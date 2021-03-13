let mongoose = require("mongoose");

let downloadSchema = new mongoose.Schema({
  linkId: mongoose.Schema.Types.ObjectId,
  fileName: String,
  userId: String,
  date: Date,
});

module.exports = mongoose.model("Download", downloadSchema);
