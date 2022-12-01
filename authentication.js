const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const FacebookTokenStrategy = require('passport-facebook-token');

const User = require('./models/users.js');
const config = require('./config.js');

/*Configure Local Strategy
in this case we use passport local mongoose plugin
if not, The strategy requires a verify callback, 
which accepts these credentials and calls done providing a user. */
exports.local = passport.use(new LocalStrategy(User.authenticate()));

// determines which data of the user object should be stored in the session
passport.serializeUser(User.serializeUser());

// to look up the user in the database and retrieve the user object with data.
passport.deserializeUser(User.deserializeUser());

// Generate the token using json web token module.
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 })
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// Configure Json Web Token Strategy using passport-jwt.Strategy module.
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

// authenticate request using JWT Strategy
// check the user token that been sent by the user request to the server.
exports.verifyUser = passport.authenticate('jwt', { session: false });

// authenticate if the user is an admin.
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    }
    else {
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        next(err);
    }
};

// Configuring the passport facebook token.
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));