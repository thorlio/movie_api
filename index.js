const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { generateJWTToken } = require('./auth');
const app = express();
const Movies = Models.Movie;
const Users = Models.User;
const port = process.env.PORT || 8080;
const favicon = require('serve-favicon');
const path = require('path');

// Database connection
// mongoose.connect('mongodb://localhost:27017/myNewDatabase')
// .then(() => {
//   console.log('Connected to MongoDB');
// })
// .catch((err) => { 
//   console.log('Could not connect to MongoDB:', err);
// });

mongoose.connect('mongodb+srv://thorlio3:PUXWVUhLT85ew3Pi@cluster0.1sglm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => { 
  console.log('Could not connect to MongoDB:', err);
});

// Middleware

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use('/documentation', express.static('public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Passport and authentication middleware
require('./passport');
app.use(passport.initialize());

// Global JWT authentication middleware 
app.use((req, res, next) => {
  const nonAuthRoutes = ['/login', '/register', '/favicon.ico', '/', 'users']; 
  if (nonAuthRoutes.includes(req.path) && req.method === 'POST') {
    return next(); 
  }
  passport.authenticate('jwt', { session: false })(req, res, next);
});

app.get('/', (req, res) => {
  res.send('Welcome to the app!');
});

// Get all users
app.get('/users', (req, res, next) => {
  console.log('Authorization Header:', req.headers.authorization);
  next();
}, passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ username: req.params.username }) 
    .then(user => {
      if (user) {
        res.status(200).json(user); 
      } else {
        res.status(404).json({ error: 'User not found' }); 
      }
    })
    .catch(err => res.status(500).json({ error: err.message })); 
});

// Add new user
app.post('/users',
  [
  check('Username', 'Username is required ').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
   ], async (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req); /*checks the data the user sent (req)*/
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() }); /*if there are errors, stop everything and return a response with a list of errors*/
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
        .create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) => { res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    });
});


// app.post(
//   "/users",
//     async (req, res) => {
//     await Users.findOne({ Username: req.body.Username })
//       .then((user /*this can be any variable "foundUser", "result", etc*/) => {
//         if (user) {
//           return res.status(400).send(req.body.Username + "already exists");
//         } else {
//           Users.create({
//             Username: req.body.Username,
//             Password: req.body.Password,
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

app.post("/login", [
  check('Username', 'Username is required and must be at least 5 characters long').isLength({ min: 5}),
  check('Password', 'Password i required').notEmpty()
], async (req, res) => {
  console.log("Request body:", req.body); // Debug log

  const { Username, Password } = req.body;
  
  if (!Username || !Password) {
    return res.status(400).send("Username and Password are required");
  }

  try {
    const user = await Users.findOne({ Username });
    if (!user) {
      console.log(`User not found: ${Username}`);
      return res.status(401).send("Username not found");
    }

    const isValidPassword = await bcrypt.compare(Password, user.Password);
    if (!isValidPassword) {
      return res.status(401).send("Incorrect password");
    }

    const token = generateJWTToken(user);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("An error occurred");
  }
});

// Update user by username
app.put('/users/:Username', 
  [
  check('Username', 'Username is required and must be at least 5 characters long').isLength({ min: 5}),
  check('Password', 'Password i required').notEmpty()
], passport.authenticate('jwt', { session: false}),
async (req, res) => {
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
    { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    })
});

// Update user by email
app.put('/users/:email', 
  [
  check('Username', 'Username is required and must be at least 5 characters long').isLength({ min: 5}),
  check('Password', 'Password i required').notEmpty(),
  check('Email', 'Email must be valid').isEmail()
], passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { email: req.params.email },
    { $set: req.body },
    { new: true }
  )
  .then(user => res.status(200).json(user))
  .catch(err => res.status(400).json({ error: err.message })); 
});

// Delete user by Username and Email
app.delete('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { Username, Email } = req.query;

  if (Username) {
    Users.findOneAndDelete({ Username })
      .then(user => {
        if (user) {
          res.status(200).json({ message: 'User deleted successfully' });
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      })
      .catch(err => res.status(500).json({ error: err.message }));
  } else if (Email) {
    Users.findOneAndDelete({ Email })
      .then(user => {
        if (user) {
          res.status(200).json({ message: 'User deleted successfully' });
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      })
      .catch(err => res.status(500).json({ error: err.message }));
  } else {
    res.status(400).json({ error: 'Missing Username or Email parameter' });
  }
});

app.get('/movies', passport.authenticate('jwt', { session: false }), 
async (req, res) => {
  await Movies.find() // Get all movies
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch(( error ) => {
    console.log(error);
    res.status(500).send( 'Error: ' + error);
    });
});

// Get movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ title: req.params.title })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie);
      } else {
        res.status(404).json({ error: 'Movie not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get movies by genre
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ genre: req.params.genre })
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Add a new Movie
app.post('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  const newMovie = new Movies(req.body);
  newMovie.save()
    .then(movie => res.status(201).json(movie)) 
    .catch(err => res.status(400).json({ error: err.message }));
});

// Update a Movie by Title
app.put('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOneAndUpdate(
    { title: req.params.title },
    { $set: req.body }, 
    { new: true }
  )
  .then(movie => {
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  })
  .catch(err => res.status(400).json({ error: err.message }));
});

// Delete a movie by title
app.delete('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOneAndRemove({ title: req.params.title })
    .then(result => res.status(200).json({ message: 'Movie deleted', result }))
    .catch(err => res.status(400).json({ error: err.message }));
});

// Start the server
// app.listen(port, () => {
//   console.log(`Your app is listening on port {port}`);
// });

app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});




