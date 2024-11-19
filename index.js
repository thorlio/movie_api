const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const app = express();
const Movies = Models.Movie;
const Users = Models.User;

require('./auth.js')(app);
const passport = require('passport');
require('./passport');

const validateTokenAndUser = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized'});
    }
    Users.findById(user._id)
    .then(user => {
      if(!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.user = user;
      next();
    })
    .catch(err => res.status(500).json({ error: err.message }));
  })(req, res, next);
};

// app.use(passport.initialize());

mongoose.connect('mongodb://localhost:27017/myNewDatabase')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => { 
    console.log('Could not connect to MongoDB:', err);
  });

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(express.static('public'));
app.use('/documentation', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(validateTokenAndUser);


// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get user by username
app.get('/users/:username', (req, res) => {
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
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Update user by username
app.put('/users/:Username',
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
app.put('/users/:email', (req, res) => {
  Users.findOneAndUpdate(
    { email: req.params.email },
    { $set: req.body },
    { new: true }
  )
  .then(user => res.status(200).json(user))
  .catch(err => res.status(400).json({ error: err.message })); 
});

// Delete user by email
app.delete('/users/:email', (req, res) => {
  Users.findOneAndDelete({ email: req.params.email })
    .then(result => res.status(200).json({ message: "User deleted", result }))
    .catch(err => res.status(400).json({ error: err.message }));
});

app.get('/movies', async (req, res) => {
  await Movies.find() // Fetch all movies
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch(( error ) => {
    console.log(error);
    res.status(500).send( 'Error: ' + error);
    });
});

//Get movie by genre query
app.get('/movies', (req, res) => {
  Movies.find({ genre: req.query.genre })
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get movie by title
app.get('/movies/:title', (req, res) => {
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
app.get('/movies/genre/:genre', (req, res) => {
  Movies.find({ genre: req.params.genre })
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Add a new Movie
app.post('/movies', (req, res) => {
  const newMovie = new Movies(req.body);
  newMovie.save()
    .then(movie => res.status(201).json(movie)) 
    .catch(err => res.status(400).json({ error: err.message }));
});

// Update a Movie by Title
app.put('/movies/:title', (req, res) => {
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
app.delete('/movies/:title', (req, res) => {
  Movies.findOneAndRemove({ title: req.params.title })
    .then(result => res.status(200).json({ message: 'Movie deleted', result }))
    .catch(err => res.status(400).json({ error: err.message }));
});

// Start the server
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});





