const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initPassport = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return done(null, false, { message: 'Invalid credentials' });
      if (!user.isActive) return done(null, false, { message: 'Account deactivated' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Invalid credentials' });
      return done(null, user);
    } catch (err) { return done(err); }
  }));

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'socialAuth.providerId': profile.id });
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.socialAuth = { provider: 'google', providerId: profile.id };
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: await bcrypt.hash(Math.random().toString(36), 12),
              socialAuth: { provider: 'google', providerId: profile.id },
              role: 'customer',
            });
          }
        }
        return done(null, user);
      } catch (err) { return done(err); }
    }));
  }

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try { done(null, await User.findById(id).select('-password')); }
    catch (err) { done(err); }
  });
};

module.exports = { initPassport };
