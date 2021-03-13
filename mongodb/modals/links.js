let mongoose = require("mongoose");

let linkSchema = new mongoose.Schema({
  type: String,
  slug: String,
  fileId: String,
  public_key: String,
  fileName: String,
  size: String,
  fileType: String,
  downloads: Number,
  DDL: String,
  createdOn: Date,
  videoMediaMetadata: Object,
});

module.exports = mongoose.model("Link", linkSchema);
