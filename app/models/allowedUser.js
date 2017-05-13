// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var allowedUserSchema = mongoose.Schema({
    email        : String,
    name         : String
}, {collection: 'allowedUsers'});

// generating a hash
allowedUserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


// create the model for users and expose it to our app
module.exports = mongoose.model('AllowedUser', allowedUserSchema);
