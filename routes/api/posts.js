const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const { Post } = require("../../models/Post");
const { Profile } = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @route   api/posts/test
// @desc    Test post route
// @access  Public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts work" });
});

// @route   api/posts
// @desc    Get posts
// @access  Poblic

router.get("/", async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    if (!Post) {
      return res.status(404).json("There are not any posts yet");
    }
    res.send(post);
  } catch (err) {
    console.log(err);
  }
});
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!Post || post === null)
      return res.status(404).json("There are not any post with id specified");
    res.json(post);
  } catch (err) {
    console.log(err);
  }
});

// @route   api/posts
// @desc    Create post
// @access  Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { errors, isValid } = validatePostInput(req.body);
      if (!isValid) return res.status(400).json(errors);
      const newPost = await new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id,
      });

      await newPost.save();
      res.json(newPost);
    } catch (err) {
      console.log(err);
    }
  }
);

// @route   api/posts
// @desc    Delete post
// @access  Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile)
        return res.status(404).send("There is not user with id specified.");
      const post = await Post.findOne({ _id: req.params.id });
      if (!post) return res.status(404).send("There is not post id specified.");
      if (post.user.toString() !== req.user.id) {
        return res.status(401).send({ notauthorized: "User not authorized" });
      }
      await post.remove();
      res.json("Post was successfully deleted");
    } catch (err) {
      console.log(err);
    }
  }
);
// @route   api/posts/like/:id
// @desc    Like Post
// @access  Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile)
        return res.status(404).send("There is not user with id specified.");
      const post = await Post.findOne({ _id: req.params.id });
      if (!post) return res.status(404).send("There is not post id specified.");
      if (
        (post.likes.filter(
          (like) => like.user.toString() === req.user.id
        ).length = 0)
      ) {
        return res
          .status(400)
          .json({ Noliked: "You have not liked this post" });
      }
      // Get remove index
      const removeIndex = post.likes
        .map((item) => item.user.toString())
        .indexOf(req.user.id);

      // Splice the Array
      post.likes.splice(removeIndex, 1);
      await post.save();
      res.json(post);
    } catch (err) {
      console.log(err);
    }
  }
);
// @route   api/posts/like/:id
// @desc    Unlike Post
// @access  Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile)
        return res.status(404).send("There is not user with id specified.");
      const post = await Post.findOne({ _id: req.params.id });
      if (!post) return res.status(404).send("There is not post id specified.");
      if (
        post.likes.filter((like) => like.user.toString() === req.user.id)
          .length > 0
      ) {
        return res
          .status(400)
          .json({ Areadyliked: "User already liked this post" });
      }
      // Add user id to likes Array
      post.likes.unshift({ user: req.user.id });
      await post.save();
      res.json(post);
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
