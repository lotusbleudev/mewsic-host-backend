const cloudinary = require("../utils/cloudinary");
const Track = require("../models/Track");
const mongoose = require("mongoose");

const getTracks = async (req, res) => {
  const user_id = req.user._id;
  const tracks = await Track.find({ user_id });

  res.status(200).json(tracks);
};

const getTrack = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Track not found" });
  }

  const track = await Track.findById(id);

  if (!track) {
    res.status(404).json({ error: "Track not found" });
  }

  res.status(200).json(track);
};

const createTrack = async (req, res) => {
  const { title, artist, album } = req.body;
  const files = req.files;
  let result = [];
  for (const [name, obj] of Object.entries(files)) {
    result.push(
      await cloudinary.uploader.upload(obj[0].path, {
        resource_type: "auto",
      })
    );
  }

  let emptyFields = [];

  if (!title) {
    emptyFields.push("title");
  }
  if (!artist) {
    emptyFields.push("artist");
  }

  if (
    !result.filter((obj) => {
      return obj.resource_type === "image";
    })[0]
  ) {
    emptyFields.push("cover");
  }

  if (
    !result.filter((obj) => {
      return obj.resource_type === "video";
    })[0]
  ) {
    emptyFields.push("audio");
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please fill in all the fields",
      emptyFields,
    });
  }

  try {
    const user_id = req.user._id;
    console.log(user_id);

    let track = new Track({
      title: req.body.title,
      artist: req.body.artist,
      album: req.body.album || null,
      cover: result.filter((obj) => {
        return obj.resource_type === "image";
      })[0].secure_url,
      audio: result.filter((obj) => {
        return obj.resource_type === "video";
      })[0].secure_url,
      cover_cloudinary_id: result.filter((obj) => {
        return obj.resource_type === "image";
      })[0].public_id,
      audio_cloudinary_id: result.filter((obj) => {
        return obj.resource_type === "video";
      })[0].public_id,
      user_id: user_id,
    });

    await Track.create(track);
    res.status(200).json(track);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTrack = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Track not found" });
  }

  let t = await Track.findById(id);

  await cloudinary.uploader.destroy(t.audio_cloudinary_id, {
    resource_type: "video",
  });
  await cloudinary.uploader.destroy(t.cover_cloudinary_id);

  const track = await Track.findOneAndDelete({ _id: id });

  if (!track) {
    res.status(404).json({ error: "Track not found" });
  }

  res.status(200).json(track);
};

const updateTrack = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "Track not found" });
  }

  let t = await Track.findById(req.params.id);

  await cloudinary.uploader.destroy(t.cover_cloudinary_id);

  const file = req.file;

  let result = await cloudinary.uploader.upload(file.path);

  const data = {
    title: req.body.title || t.name,
    cover: result?.secure_url || t.cover,
    audio: t.audio,
    cover_cloudinary_id: result?.public_id || t.cover_cloudinary_id,
    audio_cloudinary_id: t.audio_cloudinary_id,
  };

  const track = await Track.findOneAndUpdate({ _id: id }, data);

  if (!track) {
    res.status(404).json({ error: "Track not found" });
  }

  res.status(200).json(track);
};

module.exports = { createTrack, getTracks, getTrack, deleteTrack, updateTrack };
