const express = require("express");
const {
  createTrack,
  getTracks,
  getTrack,
  deleteTrack,
  updateTrack,
} = require("../controllers/trackController");
const requireAuth = require("../middleware/requireAuth");
const upload = require("../utils/multer");

const router = express.Router();

router.use(requireAuth);

router.get("/", getTracks);

router.get("/:id", getTrack);

router.post(
  "/",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  createTrack
);

router.delete("/:id", deleteTrack);

router.patch("/:id", upload.single("cover"), updateTrack);

module.exports = router;
