const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

    app.use(morgan('combined'));

// Static request
app.use(express.static('public'));

let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};

let movies = [
  {
    id: 1,
    title: 'Shanghai Knights',
    director: {
      name: 'David Dobkin',
      birth: 'June 23, 1969',
      death: 'Active'
    },
    genre: 'Martial Arts, Action, Comedy',
    stars: 'Jackie Chan, Owen Wilson, Fann Wong',
    year: '2003'
  },
  {
    id: 2,
    title: 'Up',
    director: {
      name: 'Pete Docter',
      birth: 'October 9, 1968',
      death: 'Active'
    },
    genre: 'Animation, Comedy, Family',
    stars: 'Edward Asner, Jordan Nagai, John Ratzenberger',
    year: '2009'
  },
  { 
    id: 3,
    title: 'Twilight',
    director: {
      name: 'Stephanie Meyer',
      birth: 'December 24, 1973',
      death: 'Active'
    },
    genre: 'Dark Fantasy, Romance, Fantasy',
    stars: 'Kristen Stewart, Robert Pattinson, Billy Burke',
    year: '2008'
  },
  {
    id: 4,
    title: 'Step Up',
    director: {
      name: 'Anne Fletcher',
      birth: 'May 1, 1966',
      death: 'Active'
    },
    genre: 'Crime, Drama, Music',
    stars: 'Channing Tatum, Jenna Dewan, Damaine Radcliff',
    year: '2006'
  }
];

app.use(myLogger);

app.use('/documentation', express.static('public'));

// Register - POST
app.post('/movies', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
      newUser.id = uuid.v4();
      movies.push(newUser);
      res.status(201).json(newUser)
  } else {
      res.status(400).send('Please enter a name')
  }
})

// Update - PUT
app.put('/movies/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let movie = movies.find( user => user.id == id);

  if (movie) {
      movie.name = updatedUser.name;
      res.status(200.).json(user);
  } else {
      res.status(400).send('User not found')
  }
})

app.post('/movies/:id/:title', (req, res) => {
  const { id, title } = req.params;

  let movie = movies.find( movie => movie.id == id);

  if (movie) {
      movie.favoriteMovies.push(title);
      res.status(200).send(`${title} has been added to user ${id}'s array`);
  } else {
      res.status(400).send('User not found')
  }
})

// Read - GET

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) => 
  { return movie.title === req.params.title}));

  if (movie) {
      res.status(200).json(movie);
  } else {
      res.status(400).send('No such movie')
  }
})

app.get('/movies/title/genre', (req, res) => {
  res.json(movies.find((genre) => 
  { return movie.genre === req.params.genre}));

  if (genre) {
      res.status(200).json(genre);
  } else {
      res.status(400).send('No such genre')
  }
})

app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.director.Name === directorName).Director;

  if (director) {
      res.status(200).json(director);
  } else {
      res.status(400).send('No such director')
  }
})

//listen for request
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});