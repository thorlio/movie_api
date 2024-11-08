const passport = require('passport');
  LocalStrategy = require('passport-local').Strategy;
  Models = require('./models.js');
  passportJWT = require('passport-jwt');

let Users = Models.User;

  JWTStrategy = require('passport-jwt').Strategy;
  ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      await Users.findOne({ Username: username})
      .then((user) => {
        if(!user) {
          console.log('Incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }
        console.log('User found');
        return callback(null, user);
      })
      .catch((error) => {
        console.log(error);
        return callback(error);
      });
    }
  )
);

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, (jwtPayload, done) => {
  console.log("JWT Payload:", jwtPayload);
  Users.findById(jwtPayload.id)
    .then(user => {
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    })
    .catch(err => done(err));
  }));

  module.exports = passport;