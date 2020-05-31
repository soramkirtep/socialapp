const express = require("express");
const router = express.Router();

// @route   api/userss/test
// @desc    Test users route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Users work" });
});

module.exports = router;
