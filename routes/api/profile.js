const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExpInput = require("../../validation/experience");
const validateEduInput = require("../../validation/education");

const { User } = require("../../models/User");
const { Profile } = require("../../models/Profile");

// @route   api/profile/test
// @desc    Test profile route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "profile works" });
});

// @route   get api/profile
// @desc    gets current user profile route
// @access  Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const errors = {};
      let profile = await Profile.findOne({
        user: req.user.id,
      }).populate("user", ["name", "avatar"]);
      if (!profile) {
        errors.noprofile = "There is not a profile for this user.";
        return res.status(404).send(errors);
      }
      res.status(200).send(profile);
    } catch (err) {
      console.log(err);
    }
  }
);

// @route   GET api/profile/all
// @desc    GET all profiles
// @access  Public
router.get("/all", async (req, res) => {
  try {
    const errors = {};
    profile = await Profile.find().populate("user", ["name", "avatar"]);
    if (!profile) {
      errors.noprofile = "There is not any profile yet.";
      return res.status(404).send(errors);
    }
    res.status(200).send(profile);
  } catch (err) {
    console.log(err);
  }
});

// @route   GET api/profile/handle/:handle
// @desc    GET users profile
// @access  Public

router.get("/handle/:handle", async (req, res) => {
  try {
    const errors = {};
    const profile = await Profile.findOne({
      handle: req.params.handle,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      errors.noprofile = "There is not profile with handle specified.";
      return res.status(404).send(errors);
    }
    res.status(200).send(profile);
  } catch (err) {
    console.log(err);
  }
});
// @route   GET api/profile/user/:user_id
// @desc    GET profile by user id
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const errors = {};
    const user = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!user) {
      errors.nouser = "There is not user with id specified.";
      return res.status(404).send(errors);
    }
    res.status(200).send(user);
  } catch (err) {
    console.log(err);
  }
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).send(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.send(profile));
        });
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExpInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then((profile) => res.json(profile));
    });
  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { errors, isValid } = validateEduInput(req.body);

      // Check Validation
      if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
      }

      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile)
        return res.status(404).send("there is not user id specified");

      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // Add to exp array
      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
    }
  }
);
// @route   DELETE api/profile/experience:exp_id
// @desc    delete experience
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile)
        return res.status(404).send("there is not user id specified");
      // Get idenx remove
      const removeIndex = await profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);

      // splice out of attay
      profile.experience.splice(removeIndex, 1);

      // Save
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
    }
  }
);
// @route   DELETE api/profile/education:edu_id
// @desc    delete education
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile)
        return res.status(404).send("there is not user id specified");
      // Get idenx remove
      const removeIndex = await profile.education
        .map((item) => item.id)
        .indexOf(req.params.edu_id);

      // splice out of attay
      profile.education.splice(removeIndex, 1);

      // Save
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
    }
  }
);

// @route   DELETE api/profile
// @desc    delete user and profile
// @access  Private

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOneAndRemove({ user: req.user.id });
      if (!profile)
        return res.status(404).send("there is not user id specified");
      const user = await User.findOneAndRemove({ _id: req.user.id });
      if (!user) return res.status(404).send("there is not user id specified");
      res.status(200).send("User and profile has been removed successfully!");
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
