const express = require("express");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const passport = require("passport");

const app = express();

// Body parser middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

const db = require("./config/keys").mongoURI;

mongoose
  .connect(db)
  .then(() => console.log("MongoDB is connected..."))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);
// Routes
app.get("/", (req, res) => {
  res.send("Hello social app user");
});

app.use(express.json());
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on port ${port}...`));
