var admin = require('../config/admin.js');
// load up the user model
var User   = require('./models/user');
var stravaQ = require('./strava');
var eventDetails = require('./eventDetails')

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            // stravaQ.getRide(req.user, null, function(err, data){
            //     if (err) {
            //         res.render('index.ejs', {
            //             user : req.user,
            //             ride : null
            //         });
            //
            //     } else {
            //         res.render('index.ejs', {
            //             user : req.user,
            //             ride : data
            //         });
            //     }
            // });

            res.render('index.ejs', {
                user : req.user,
                ride : null
            });


        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


    });

    // show the home page (will also have our login links)
    app.get('/jett', function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            stravaQ.getRides(req.user, eventDetails.jett, function(err, data){
                if (err) {
                    res.render('index.ejs', {
                        user : req.user,
                        ride : null
                    });
                } else {
                    res.render('jett.ejs', {
                        user : req.user,
                        rides : data
                    });
                }
            });

        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // lf2017 SECTION =========================
    app.get('/lf2017', isLoggedIn, function(req, res) {
        res.render('years/2017.ejs', {
            user : req.user
        });
    });
    app.get('/lf2017whoin', isLoggedIn, function(req, res) {
        res.render('years/2017-who.ejs', {
            user : req.user
        });
    });
    app.get('/lf2017standings', isLoggedIn, function(req, res) {
        res.render('years/2017-standings.ejs', {
            user : req.user
        });
    });
    app.get('/lf2017stage1', isLoggedIn, function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            stravaQ.getRides(req.user, eventDetails.stage1, function(err, data){
                if (err) {
                    res.render('index.ejs', {
                        user : req.user,
                        ride : null
                    });
                } else {
                    res.render('years/2017-stage1.ejs', {
                        user : req.user,
                        rides : data
                    });
                }
            });

        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


    });

    app.get('/lf2017stage2', isLoggedIn, function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            stravaQ.getRides(req.user, eventDetails.stage2, function(err, data){
                if (err) {
                    res.render('index.ejs', {
                        user : req.user,
                        ride : null
                    });
                } else {
                    res.render('years/2017-stage2.ejs', {
                        user : req.user,
                        rides : data
                    });
                }
            });

        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


    });

    app.get('/lf2017stage3', isLoggedIn, function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            stravaQ.getRides(req.user, eventDetails.stage3, function(err, data){
                if (err) {
                    res.render('index.ejs', {
                        user : req.user,
                        ride : null
                    });
                } else {
                    res.render('years/2017-stage3.ejs', {
                        user : req.user,
                        rides : data
                    });
                }
            });

        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


    });

    app.get('/lf2017stage4', isLoggedIn, function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            stravaQ.getRides(req.user, eventDetails.stage4, function(err, data){
                if (err) {
                    res.render('index.ejs', {
                        user : req.user,
                        ride : null
                    });
                } else {
                    res.render('years/2017-stage4.ejs', {
                        user : req.user,
                        rides : data
                    });
                }
            });

        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


    });

    app.get('/lf2017stage5', isLoggedIn, function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            stravaQ.getRides(req.user, eventDetails.stage5, function(err, data){
                if (err) {
                    res.render('index.ejs', {
                        user : req.user,
                        ride : null
                    });
                } else {
                    res.render('years/2017-stage5.ejs', {
                        user : req.user,
                        rides : data
                    });
                }
            });

        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


    });

    app.get('/lf2017stage6', isLoggedIn, function(req, res) {
        // query User strava for active event
        if (req.isAuthenticated())
        {
            stravaQ.getRides(req.user, eventDetails.stage6, function(err, data){
                if (err) {
                    res.render('index.ejs', {
                        user : req.user,
                        ride : null
                    });
                } else {
                    res.render('years/2017-stage6.ejs', {
                        user : req.user,
                        rides : data
                    });
                }
            });

        }
        else {
            res.render('index.ejs', {
                user : req.user,
                ride : null
            });
        }


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

        // // SIGNUP =================================
        // // show the signup form
        // app.get('/signup', isLoggedIn, isLf2017, function(req, res) {
        //     res.render('signup.ejs', {
        //         user: req.user
        //     });
        // });



    // strava ---------------------------------

        // send to strava to do the authentication
        app.get('/auth/strava', passport.authenticate('strava', { scope : ['public'] }));

        // the callback after google has authenticated the user
        app.get('/auth/strava/callback', function(req, res, next) {
            passport.authenticate('strava', function(err, user, info) {
                // This is the default destination upon successful login.
                var redirectUrl = '/';

                if (err) { return next(err); }
                if (!user) { return res.redirect('/'); }

                // If we have previously stored a redirectUrl, use that,
                // otherwise, use the default.
                if (req.session.redirectUrl) {
                    redirectUrl = req.session.redirectUrl;
                    req.session.redirectUrl = null;
                }
                req.logIn(user, function(err){
                    if (err) { return next(err); }
                });
                res.redirect(redirectUrl);
            })(req, res, next);
        });




// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

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
    if (req.isAuthenticated()) {return next();}
    if (req.url != '/') req.session.redirectUrl = req.url;
    res.redirect('/auth/strava');
}

function isLf2017(req, res, next) {

    var user = req.user;
    if (typeof(user) == 'undefined')
        res.redirect('/');
    User.findById(user._id, function(err, foundUser){
        if(err){
            res.status(422).json({error: 'No user found.'});
            return next(err);
            res.redirect('/');
        }
        if( foundUser.events.length > 0) {
            return next();
        }
        res.redirect('/');
    });

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
