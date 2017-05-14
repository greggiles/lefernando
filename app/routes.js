var admin = require('../config/admin.js');
// load up the user model
var User       = require('./models/user');

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            user : req.user
        });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // PROFILE SECTION =========================
    app.get('/lf2017', isLoggedIn, function(req, res) {
        res.render('years/2017.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// ADMIN Stuff?  ==================================================
// =============================================================================
    // LOGIN ===============================
    // show the login form

    app.post('/makeadmin', isAdmin, function(req, res){
        if ('591619408a967e2efc0197b0' == req.body.userId)
            res.redirect('/');
        else {
            User.findOneAndUpdate( {_id: req.body.userId}, {$set:{role:req.body.role}},function(err, doc){
                if(err){
                    console.log("Something wrong when updating data!");
                }
                res.redirect('/admin');
            });
        }

    });

    app.post('/makeLF', isAdmin, function(req, res){
        var conditions = {
            _id: req.body.userId,
            'events.name' : { $ne: 'lf2017'}
        };
        var update = {
            $addToSet: { events: { "name": "lf2017"}}
        };
        User.findOneAndUpdate(conditions, update, function(err, doc){
            if(err){
                console.log("Something wrong when updating data!");
            }
            res.redirect('/admin');

        });
    });

    app.get('/admin', isAdmin, function(req, res) {
        admin.listUsers( function (users) {
            res.render('admin.ejs', {
                users: users,
                user : req.user
            });
        });
    });
    // process the login form
    app.post('/updateuser', passport.authenticate('user-update', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


    // strava ---------------------------------

        // send to google to do the authentication
        app.get('/auth/strava', passport.authenticate('strava', { scope : ['public'] }));

        // the callback after google has authenticated the user
        app.get('/auth/strava/callback',
            passport.authenticate('strava', {
                successRedirect : '/',
                failureRedirect : '/'
            }));


    // strava ---------------------------------

    // send to google to do the authentication
    app.get('/connect/strava', passport.authorize('strava', { scope : ['public'] }));

    // the callback after google has authorized the user
    app.get('/connect/strava/callback',
        passport.authorize('strava', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // strava ---------------------------------
    app.get('/unlink/strava', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.strava.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function isAdmin(req, res, next) {

    var user = req.user;
    if (typeof(user) == 'undefined')
        res.redirect('/');
    User.findById(user._id, function(err, foundUser){
        if(err){
            res.status(422).json({error: 'No user found.'});
            return next(err);
            res.redirect('/');
        }
        if('admin' === foundUser.role){
            return next();
        }
        res.redirect('/');
    });

}
