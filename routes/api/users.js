const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

// @route   api/users/test
// @desc    Test users route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Users work" });
});

// @route   api/users/register
// @desc    Register route
// @access  Public
router.post("/register", async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .send(`User with email ${req.body.email} is already registered.`);

    const avatar = gravatar.url(req.body.email, {
      s: "200", //size
      r: "pg", // Rating
      d: "mm", //Default
    });
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.save();
    res.status(200).send(user);
  } catch (err) {
    next(console.log(err));
  }
});
module.exports = router;
