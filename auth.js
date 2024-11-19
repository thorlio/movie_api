const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('./passport');

function generateJWTToken(user) {
  const payload = {
    _id: user._id,      
    Username: user.Username,
    Email: user.Email,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: '7d', algorithm: 'HS256' });
}

module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Incorrect username or password',
          user: user,
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.send(error);
        }

        let token = generateJWTToken(user.toJSON());

        return res.json({ user, token });
      });
    })(req, res);
  });
};