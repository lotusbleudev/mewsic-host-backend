const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const trackSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
  },
  cover: {
    type: String,
  },
  audio: {
    type: String,
    required: true,
  },
  cover_cloudinary_id: {
    type: String,
  },
  audio_cloudinary_id: {
    type: String,
  },
  user_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Track", trackSchema);
