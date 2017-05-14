// load all the things we need

// load up the user model
var User       = require('../app/models/user');
var AllowedUsers = require('../app/models/allowedUser');

// =========================================================================
// Strava ==================================================================
// =========================================================================
exports.listUsers = function (cb) {
        User.find({}, function (err, users) {
            if (err)
                return cb(err);
            cb(users);
        });
    };

exports.xlistUsers = function (req, res, next) {
    User.find({}, function (err, users) {
        if (err)
            return cb(err);

        console.log(users);
        next();
    });
};
