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
    director: 'David Dobkin'
  },
  {
    title: 'Up',
    director: 'Pete Docter'
  },
  {
    title: 'Twilight',
    director: 'Stephanie Meyer'
  }
];

app.use(myLogger);

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.use('/documentation', express.static('public'));

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content');
});

app.get('/index.html', (req, res) => {
  res.sendFile('/index.html', { root: __dirname });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

