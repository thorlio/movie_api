const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();

app.use(bodyParser.json());
app.use(morgan('combined'));

// Static request
app.use(express.static('public'));
// app.use(myLogger);
app.use('/documentation', express.static('public'));

// let myLogger = (req, res, next) => {
//   console.log(req.url);
//   next();
// };

const movies = [
  {
    "id": 1,
    "title": 'Shanghai Knights',
    "director": {
      "name": 'David Dobkin',
      "birth": 'June 23, 1969',
      "death": 'Active'
    },
    "genre": 'Martial Arts, Action, Comedy',
    "stars": 'Jackie Chan, Owen Wilson, Fann Wong',
    "year": '2003'
  },
  {
    "id": 2,
    "title": 'Up',
    "director": {
      "name": 'Pete Docter',
      "birth": 'October 9, 1968',
      "death": 'Active'
    },
    "genre": 'Animation',
    "stars": 'Edward Asner, Jordan Nagai, John Ratzenberger',
    "year": '2009'
  },
  { 
    "id": 3,
    "title": 'Twilight',
    "director": {
      "name": 'Stephanie Meyer',
      "birth": 'December 24, 1973',
      "death": 'Active'
    },
    "genre": 'Dark Fantasy',
    "stars": 'Kristen Stewart, Robert Pattinson, Billy Burke',
    "year": '2008'
  },
  {
    "id": 4,
    "title": 'Step Up',
    "director": {
      "name": 'Anne Fletcher',
      "birth": 'May 1, 1966',
      "death": 'Active'
    },
    "genre": 'Music',
    "stars": 'Channing Tatum, Jenna Dewan, Damaine Radcliff',
    "year": '2006'
  }
];

let users = [
  {
  "id": 10,
  "name": 'Sandy Thor',
  "email": 'thorlio3@gmail.com'
  }
];

app.get('/movies/', (req, res) => {
  res.json(movies).send('Successful GET request for data on all movies');
});

app.get('/movies/:title', (req, res) => {
  const movie = movies.find((movie) => movie.title.toLowerCase() === req.params.title.toLowerCase());
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

//get genre of movies
app.get('/movie/:genre', (req, res) => {
  const genre = req.params.genre.toLowerCase();
  const matchingMovies = movies.filter((movie) => movie.genre.toLowerCase().includes(genre));

  if (matchingMovies.length > 0) {
    res.json(matchingMovies).send(`Successful GET request for movies of genre: ${req.params.genre}`);
  } else {
    res.status(404).send('No movies found in this genre');
  }
});

//adds data for a new movie to the list
app.post('/movies', (req, res) => {
  let newMovie = req.body;

  if (!newMovie.title || !newMovie.genre || !newMovie.director || !newMovie.year) {
    return res.status(400).send('Missing name in request body');
  }

  newMovie.id = uuid.v4();
  movies.push(newMovie);
  res.status(201).send(newMovie);
});

//deletes a movie from the list by ID
app.delete('/movies/:id', (req, res) => {
  let movie = movies.find((movie) => movie.id === parseInt(req.params.id));

  if (movie) {
    movies = movies.filter((obj) => obj.id !== parseInt(req.params.id));
    res.status(201).send(`Successful DELETE request for movie with ID: ${req.params.id}`);
  } else {
    res.status(404).send('Movie not found');
  }
});

//update the death date by director name
app.put('/movies/director/:name/death', (req, res) => {
  const directorName = req.params.name;
  const deathDate = req.body.death;

  let movie = movies.find((movie) => movie.director.name.toLocaleLowerCase() === directorName.toLowerCase());

  if (movie) {
    movie.director.death = deathDate;
    res.status(200).send(`Updated death date for director ${directorName} to ${deathDate}`);
  } else {
    res.status(404).send('Director not found');
  }
});

//allow new users to register
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (!newUser.username || !newUser.email) {
    return res.status(400).send('Missing user information in request body');
  }

  newUser.id = uuid.v4();

  users.push(newUser);
  res.status(201).send({
    message: 'Successful POST request to reguster a new user',
    user: newUser
  });
});

//listen for request
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});



















// // Register - POST
// app.post('/movies', (req, res) => {
//   const newUser = req.body;

//   if (newUser.name) {
//       newUser.id = uuid.v4();
//       movies.push(newUser);
//       res.status(201).json(newUser)
//   } else {
//       res.status(400).send('Please enter a name')
//   }
// })

// // Update - PUT
// app.put('/movies/:id', (req, res) => {
//   const { id } = req.params;
//   const updatedUser = req.body;

//   let movie = movies.find( user => user.id == id);

//   if (movie) {
//       movie.name = updatedUser.name;
//       res.status(200.).json(user);
//   } else {
//       res.status(400).send('User not found')
//   }
// })

// app.post('/movies/:id/:title', (req, res) => {
//   const { id, title } = req.params;

//   let movie = movies.find( movie => movie.id == id);

//   if (movie) {
//       movie.favoriteMovies.push(title);
//       res.status(200).send(`${title} has been added to user ${id}'s array`);
//   } else {
//       res.status(400).send('User not found')
//   }
// })

// // Read - GET

// app.get('/movies', (req, res) => {
//   res.status(200).json(movies);
// })

// app.get('/movies/:title', (req, res) => {
//   res.json(movies.find((movie) => movie.title === req.params.title});

//   if (movie) {
//       res.status(200).json(movie);
//   } else {
//       res.status(400).send('No such movie')
//   }


// app.get('/movies/title/genre', (req, res) => {
//   res.json(movies.find((genre) => 
//   { return movie.genre === req.params.genre}));

//   if (genre) {
//       res.status(200).json(genre);
//   } else {
//       res.status(400).send('No such genre')
//   }
// })

// app.get('/movies/directors/:directorName', (req, res) => {
//   const { directorName } = req.params;
//   const director = movies.find( movie => movie.director.Name === directorName).Director;

//   if (director) {
//       res.status(200).json(director);
//   } else {
//       res.status(400).send('No such director')
//   }
// })

