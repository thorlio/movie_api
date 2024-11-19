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
      async (username, password, callback) => {
        console.log(`Attempting login for username: ${username}`);
  
        try {
          // Find user by username
          const user = await Users.findOne({ Username: username });
  
          if (!user) {
            console.log('User not found');
            return callback(null, false, { message: 'Incorrect username or password.' });
          }
  
          // Check if password is correct
          const isValidPassword = await bcrypt.compare(password, user.Password);
  
          if (!isValidPassword) {
            console.log('Incorrect password');
            return callback(null, false, { message: 'Incorrect username or password.' });
          }
  
          console.log('Login successful for user:', username);
          return callback(null, user);
        } catch (error) {
          console.error('Error during authentication:', error);
          return callback(null, false, { message: 'An error occurred during authentication. Please try again later.' });
        }
      }
    )
  );

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret',
      },
      async (jwtPayload, callback) => {
        try {
          const user = await Users.findById(jwtPayload._id);
  
          if (!user) {
            console.log('User not found for the provided token');
            return callback(null, false, { message: 'User not found. Please login again.' });
          }
  
          console.log('JWT authentication successful for user:', user.Username);
          return callback(null, user);
        } catch (error) {
          console.error('Error during JWT authentication:', error);
          return callback(null, false, { message: 'An error occurred during JWT authentication. Please try again later.' });
        }
      }
    )
  );