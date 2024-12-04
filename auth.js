require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
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

module.exports = { generateJWTToken, router: (router) => {
  router.post('/login', (req, res) => {
    if (!req.body.Username || !req.body.Password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(401).json({
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
}};