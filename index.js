require("dotenv").config();
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
const jwt = require("jsonwebtoken");

mongoose.connect("mongodb://localhost:27017/myNewDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri =
//   "mongodb+srv://thorlio3:Sacramento%408@cluster0.1sglm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// mongoose
//   .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 })
//   .then(() => console.log("Connected to MongoDB!"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// mongoose.set("debug", true);

const allowedOrigins = [
  "http://localhost:3000",
  "https://flixandchill-frontend.netlify.app",
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(express.static("public"));
app.use("/documentation", express.static("public"));
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

let auth = require("./auth.js")(app);

require("./passport.js");

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Flix and Chill App!");
});

app.post("/login", async (req, res) => {
  const { Username, Password } = req.body;

  try {
    const user = await Users.findOne({ Username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isValidPassword = await user.validatePassword(Password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ Username: user.Username }, "your_jwt_secret", {
      expiresIn: "7d",
    });

    res.status(200).json({
      user: {
        Username: user.Username,
        Email: user.Email,
        Birthday: user.Birthday,
      },
      token,
    });
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get user by username
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.username })
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
// app.post(
//   "/users",
//   [
//     check("Username", "Username is required").isLength({ min: 5 }),
//     check(
//       "Username",
//       "Username contains non alphanumeric characters - not allowed."
//     ).isAlphanumeric(),
//     check("Password", "Password is required").not().isEmpty(),
//     check("Email", "Email does not appeare to be valid").isEmail(),
//   ],
//   async (req, res) => {
//     let errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }

//     let hashedPassword = Users.hashPassword(req.body.Password);
//     await Users.findOne({ Username: req.body.Username })
//       .then((user) => {
//         if (user) {
//           return res.status(400).send(req.body.Username + "already exists");
//         } else {
//           Users.create({
//             Username: req.body.Username,
//             Password: hashedPassword,
//             Email: req.body.Email,
//             Birthday: req.body.Birthday,
//           })
//             .then((user) => {
//               res.status(201).json(user);
//             })
//             .catch((error) => {
//               console.error(error);
//               res.status(500).send("Error: " + error);
//             });
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//         res.status(500).send("Error: " + error);
//       });
//   }
// );

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
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

//Get all movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => res.status(200).json(movies))
      .catch((err) => res.status(500).json({ error: err.message }));
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

const path = require("path");

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
