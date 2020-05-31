const express = require("express");
const router = express.Router();

// @route   api/profile/test
// @desc    Test profile route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "profile works" });
});

module.exports = router;
