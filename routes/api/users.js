const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secretOrKey } = require("../../config/keys");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

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
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) return res.status(400).send(errors);
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

// @route   api/users/login
// @desc    Login user, returning json token
// @access  Public
router.post("/login", async (req, res, next) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);

    const email = req.body.email;
    let password = req.body.password;
    const user = await User.findOne({ email });
    if (!user) {
      errors.email = "User not found";
      return res.status(400).send(errors);
    }

    bcrypt.compare(password, user.password).then(async (isMatch) => {
      if (isMatch) {
        const payload = { id: user.id, name: user.name };
        jwt.sign(payload, secretOrKey, { expiresIn: 3600 }, (err, token) => {
          if (err)
            return res.error(console.log("jwt createerror", err)).status(500);
          res.send({ success: true, token: "Bearer " + token });
        });
      } else {
        errors.password = "password incorrect";
        return res.status(400).send(errors);
      }
    });
  } catch (err) {
    next(console.log(err));
  }
});

// @route   api/users/current
// @desc    return  current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res
      .status(200)
      .send({ id: req.user.id, name: req.user.name, email: req.user.email });
  }
);

module.exports = router;
