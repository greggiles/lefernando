// load all the things we need
var StravaStrategy   = require('passport-strava-oauth2').Strategy;

// load up the user model
var User       = require('../app/models/user');
var AllowedUsers = require('../app/models/allowedUser');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // Strava ==================================================================
    // =========================================================================
    passport.use(new StravaStrategy({

            clientID        : configAuth.stravaAuth.clientID,
            clientSecret    : configAuth.stravaAuth.clientSecret,
            callbackURL     : configAuth.stravaAuth.callbackURL,
            passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'strava.id' : profile.id }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token
                            // (user was linked at one point and then removed)
                            if (!user.strava.token) {
                                user.strava.token = token;
                                user.strava.name  = profile.displayName;
                                user.strava.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                                user.save(function(err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {

                            AllowedUsers.findOne({ 'email' : profile.emails[0].value }, function(err, allowedUser) {
                                if (err)
                                    return done(err);
                                else {
                                    var newUser          = new User();

                                    newUser.strava.id    = profile.id;
                                    newUser.strava.token = token;
                                    newUser.strava.name  = profile.displayName;
                                    newUser.strava.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                                    if (allowedUser != null){
                                        newUser.events = [{"name": "lf2017"}];
                                    }

                                    newUser.save(function(err) {
                                        if (err)
                                            return done(err);

                                        return done(null, newUser);
                                    });
                                }

                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user               = req.user; // pull the user out of the session

                    user.strava.id    = profile.id;
                    user.strava.token = token;
                    user.strava.name  = profile.displayName;
                    user.strava.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                    user.save(function(err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }

            });

        }));



};
