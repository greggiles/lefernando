// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var eventSchema = mongoose.Schema({
    name         : String,
    stage        : Number,
    startTime    : Date,
    locked       : Boolean,
    strava           : {
        course       : Number,
        start        : Number,
        finish       : Number,
        climbs       : [ Number ],
        sprints      : [ Number ],
        name         : String
    },
    results: [{
        name: String,
        id: Number,
        courseStart: String,
        courseDur: String,
        startStart: String,
        startDur: String,
        finishStart: String,
        finishDur: String,
        resultTime:

        enum: ['rider', 'admin', 'editor'],
        default: 'rider'
    }]


});

// create the model for users and expose it to our app
module.exports = mongoose.model('Event', eventSchema);
