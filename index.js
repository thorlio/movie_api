const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Models = require("./models.js");
const app = express();
const Movies = Models.Movie;
const Users = Models.User;
const cors = require("cors");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const port = process.env.PORT || 8080;

// mongoose.connect("mongodb://localhost:27017/myNewDatabase", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(express.static("public"));
app.use("/documentation", express.static("public"));

app.use(cors());
let auth = require("./auth.js")(app);

require("./passport.js");

// Get all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => res.status(200).json(users))
      .catch((err) => res.status(500).json({ error: err.message }));
  }
);

// Get user by username
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ username: req.params.username })
      .then((user) => {
        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: "User not found" });
        }
      })
      .catch((err) => res.status(500).json({ error: err.message }));
  }
);

// Add new user
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appeare to be valid").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Delete user by userame and password
// app.delete("/users/:email", (req, res) => {
//   Users.findOneAndDelete({ email: req.params.email })
//     .then((result) => res.status(200).json({ message: "User deleted", result }))
//     .catch((err) => res.status(400).json({ error: err.message }));
// });

//Get all movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Get movie by title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title })
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie);
        } else {
          res.status(404).json({ error: "Movie not found" });
        }
      })
      .catch((err) => res.status(500).json({ error: err.message }));
  }
);

// Add a new Movie
app.post(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const newMovie = new Movies(req.body);
    await newMovie
      .save()
      .then((movie) => res.status(201).json(movie))
      .catch((err) => res.status(400).json({ error: err.message }));
  }
);

// Update a Movie by Title
app.put(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOneAndUpdate(
      { title: req.params.title },
      { $set: req.body },
      { new: true }
    )
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie);
        } else {
          res.status(404).json({ error: "Movie not found" });
        }
      })
      .catch((err) => res.status(400).json({ error: err.message }));
  }
);

// Delete a movie by title
app.delete(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOneAndRemove({ title: req.params.title })
      .then((result) =>
        res.status(200).json({ message: "Movie deleted", result })
      )
      .catch((err) => res.status(400).json({ error: err.message }));
  }
);

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
