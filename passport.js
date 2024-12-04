const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt'),
  bcrypt = require('bcrypt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'Username',
        passwordField: 'Password',
      },
      async (username, password, done) => {
        try {
          // Find user by username
          const user = await Users.findOne({ Username: username });
          if (!user) {
            console.log('User not found');
            return done(null, false, { message: 'Incorrect username.' });
          }
  
          // Check if password is correct
          const isValidPassword = await bcrypt.compare(password, user.Password);
          if (!isValidPassword) {
            console.log('Incorrect password');
            return done(null, false, { message: 'Incorrect password.' });
          }
  
          console.log('Login successful for user:', username);
          return done(null, user);
        } catch (error) {
          console.error('Error during authentication:', error);
          return done(null, false, { message: 'An error occurred during authentication. Please try again later.' });
        }
      }
    )
  );

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'jwtSecret',
      },
      async (jwtPayload, done) => {
        try {
          const user = await Users.findById(jwtPayload._id);
  
          if (!user) {
            console.log('User not found for the provided token');
            return done(null, false, { message: 'User not found. Please try again.' });
          }
  
          console.log('JWT authentication successful for user:', user.Username);
          return done(null, user);
        } catch (error) {
          console.error('Error during JWT authentication:', error);
          return done(null, false, { message: 'An error occurred during JWT authentication. Please try again later.' });
        }
      }
    )
  );