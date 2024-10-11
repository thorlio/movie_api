const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

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
    title: 'Step Up',
    director: {
      director: 'Anne Fletcher',
      birth: 'May 1, 1966',
      death: 'Active'
    },
    genre: 'Crime, Drama, Music',
    stars: 'Channing Tatum, Jenna Dewan, Damaine Radcliff',
    year: '2006'
  },
  {
    title: 'Knocked Up',
    director: {
      name: 'Judd Apatow',
      birth: 'December 6, 1967',
      death: 'Active'
    },
    genre: 'Romantic Comedy, Romance',
    stars: 'Seth Rogen, Katherine Heigi, Paul Rudd',
    year: '2007'
  },
  {
    title: 'The Break-Up',
    director: {
      name: 'Peyton Reed',
      birth: 'July 3, 1964',
      death: 'Active'
    },
    genre: 'Drama, Romantic Comedy, Romance',
    stars: 'Jennifer Aniston, Vince Vaughn, Jon Favreau',
    year: '2006'
  },
  {
    title: 'The Clean Up Crew',
    director: {
      name: 'Jon Keeyes',
      birth: 'April 5, 1969',
      death: 'Active'
    },
    genre: 'Action, Crime, Thriller',
    stars: 'Jonathan Rhys Meyers, Swen Temmel, Ekaterina Baker',
    year: '2024'
  },
];


app.use(myLogger);

app.use('/documentation', express.static('public'));

// Gets the list of data about ALL movies

app.get('/movies', (req, res) => {
  res.json(movies);
});

// Gets the data about a single movie, by title

app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) =>
    { return movie.title === req.params.title }));
});

app.get('/movies/:title/:genre', (req, res) => {
  res.json(movies.find((movies) =>
  { return movies.genre === req.params.genre }));
});

app.get('/movies/:title/:directors bio', (req, res) => {
  res.json(movies.find((movies) =>
  { return movies.director === req.params.director }));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

