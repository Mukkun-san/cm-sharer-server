let mongoose = require("mongoose");

let linkSchema = new mongoose.Schema({
  id: String,
  name: String,
  slug: String,
  size: Number,
  thumb: String,
  downloads: Number,
  createdOn: Date,
});

module.exports = mongoose.model("StreamTapeLink", linkSchema);
