// passport-config.js
import passport, { use } from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { findById } from "./models/User"; // Adjust the path according to your project structure
const jwtSecret = process.env.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await findById(jwtPayload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
