const express = require("express");
const router = express.Router();

// @route   api/posts/test
// @desc    Test post route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts work" });
});

module.exports = router;
