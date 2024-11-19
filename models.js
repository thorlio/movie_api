const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: {
    Name: String,
    Description: String
  },
  director: {
    Name: String,
    Bio: String,
  },
  actors: [String],
  imagePath: String,
  featured: Boolean
});

const userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: {type: Date, required: true},
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.methods.verifyPassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Movie , User };