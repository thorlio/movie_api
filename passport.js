const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt"),
  bcrypt = require("bcrypt");
saltRounds = 10;

async function createUser(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const user = new Users({
      Username: "username",
      Password: hashedPassword,
    });

    await user.save();
    console.log("User created successfully!");
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      try {
        const user = await Users.findOne({ Username: username });
        if (!user) {
          console.log("Incorrect username");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
          console.log("Incorrect passwordddd");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }
        console.log("Authentication successful");
        return callback(null, user);
      } catch (error) {
        console.error("Error trying to authenticate:", error);
        return callback(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    async (jwtPayload, callback) => {
      try {
        const user = await Users.findById(jwtPayload._id);
        if (!user) {
          console.log("User not found");
          return callback(null, false, { message: "User not found." });
        }
        return callback(null, user);
      } catch (error) {
        console.error("Error while validating JWT:", error);
        return callback(error);
      }
    }
  )
);
