const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");

// @route   api/profile/test
// @desc    Test profile route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "profile works" });
});

// @route   api/profile
// @desc    gets current user profile route
// @access  Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const errors = {};
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) errors.noprofile = "There is not a profile for this user.";
      return res.status(404).send(errors);
      res.status(200).send(profile);
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
