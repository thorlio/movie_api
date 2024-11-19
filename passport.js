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
            console.log(`Login failed: Username ${username} not found`);
            return callback(null, false, { message: 'Invalid username or password. Please try again.' });
          }
  
          // Check if password matches
          const isValidPassword = await bcrypt.compare(password, user.Password);
  
          if (!isValidPassword) {
            console.log(`Login failed: Incorrect password for ${username}`);
            return callback(null, false, { message: 'Invalid username or password. Please try again.' });
          }
  
          console.log(`Login successful for username: ${username}`);
          return callback(null, user);
        } catch (error) {
          console.log(`Error during authentication for username ${username}:`, error);
          return callback(error);
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
          // Find the user by the ID encoded in the JWT
          const user = await Users.findById(jwtPayload._id);
  
          if (!user) {
            console.log(`JWT authentication failed: User not found for ID ${jwtPayload._id}`);
            return callback(null, false, { message: 'User not found. Please login again.' });
          }
  
          console.log(`JWT authentication successful for user ID: ${jwtPayload._id}`);
          return callback(null, user);
        } catch (error) {
          console.log(`Error during JWT authentication:`, error);
          return callback(error);
        }
      }
    )
  );