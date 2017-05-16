/**
 * Created by GGiles on 5/14/2017.
 */
var strava = require('strava-v3'),
    moment = require('moment'),
    _ = require('lodash'),
    async = require('async');


var mongoose = require('mongoose');
var configDB = require('./config/database.js');
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database


require('moment-duration-format');

var User       = require('./app/models/user');

var date = '2017-05-01',
    time1 = '18:40:00',
    time2 = '19:20:00',
    time3 = '19:30:00',
    time4 = '21:30:00';

var args = {
    'access_token':process.env.STRAVA_TOK,
     'id' : '5954636', //JETT
    //'id' : '7815469', // BSR
    'start_date_local' : date+'T'+time1+'Z',
    'end_date_local': date+'T'+time2+'Z'
};
var args2 = {
    'access_token':process.env.STRAVA_TOK,
    'id' : '5954644', //JETT
    // 'id' : '6076569', // BSR
    'start_date_local' : date+'T'+time3+'Z',
    'end_date_local': date+'T'+time4+'Z'
};
var args3 = {
    'access_token':process.env.STRAVA_TOK,
    'id' : '5954644'
};

async.parallel([
    function (callback) {
        strava.segments.listEfforts(args,function(err,payload,limits) {
            if(!err) {
                console.log(limits);
                callback(null, payload);
            }
            else{
                console.log('return 1');
                callback(err, null);

            }
        });
    },
    function (callback) {
        strava.segments.listEfforts(args2,function(err,payload,limits) {
            if(!err) {
                console.log(limits);
                callback(null, payload);
            }
            else {
                console.log('return 2');
                callback(err, null);
            }
        });
    }
], function (err,res) {
    if(err) {
        console.log(err);
    }

    else {
        res[0].forEach(function(start) {
            console.log('checking ' + start.athlete.id + ' at ' + start.start_date_local);
            var startTime = moment(start.start_date_local);
            var finishTime = startTime.subtract(1, 'seconds');
            var finishIdx = 0;
            var totalTime = 0;
            while (finishIdx > -1 && finishIdx < res[1].length) {
                finishIdx = _.findIndex(res[1], function(o){return o.athlete.id == start.athlete.id; }, finishIdx);
                if (finishIdx > -1 && finishIdx < res[1].length) {
                    // console.log(" -- found matching ID at IDX " + finishIdx + ' at ' + res[1][finishIdx].start_date_local  + ' that took ' + res[1][finishIdx].elapsed_time);
                    finishTime = moment(res[1][finishIdx].start_date_local);
                    finishTime.add(res[1][finishIdx].elapsed_time, 'seconds');
                    if (finishTime.isAfter(startTime) )
                        break;
                    else
                        finishIdx++;
                }
                else {
                    finishTime = undefined;
                    console.log( 'hmm ... FinishIdx is ' + finishIdx);
                }
            }

            if (typeof(finishTime) != 'undefined')
            {
                totalTime = moment.duration(finishTime.diff(startTime, 'milliseconds'));
                // console.log(start.athlete.id +
                //     ':   Start: ' + startTime.format('h:mm:ss.S') +
                //     '    Finish: ' + finishTime.format('h:mm:ss.S') +
                //     '    TotalTime: ' + totalTime.format('h:mm:ss.S') );
                // console.log('looking for user ... ')

                User.findOne({ 'strava.id' : start.athlete.id }, function(err, user) {
                    if (err || null == user) {
                        console.log('User not found locally, assume not in db. Try to get; ');

                        strava.athletes.get({'id':start.athlete.id, 'access_token':process.env.STRAVA_TOK}, function (err, newAth, limits) {
                            if (err){
                                console.log('error getting user ' + err);
                            }
                            else {
                                console.log('got new user for DB from strava');
                                var newUser          = new User();

                                newUser.strava.id    = newAth.id;
                                // newUser.strava.token = ;
                                newUser.strava.name  = newAth.firstname + ' ' + newAth.lastname;
                                newUser.strava.email = (newAth.email || 'AutoAdded'); // pull the first email

                                console.log(newUser.strava.name +
                                    ':   Start: ' + startTime.format('h:mm:ss.S') +
                                    '    Finish: ' + finishTime.format('h:mm:ss.S') +
                                    '    TotalTime: ' + totalTime.format('h:mm:ss.S') );

                                newUser.save(function(err) {
                                    if (err)
                                        console.log('Error Saving User' + err);
                                });



                            }


                        });

                    }
                    else {
                        console.log(user.strava.name +
                            ':   Start: ' + startTime.format('h:mm:ss.S') +
                            '    Finish: ' + finishTime.format('h:mm:ss.S') +
                            '    TotalTime: ' + totalTime.format('h:mm:ss.S') );
                    }
                });
            }
        });
    }
});


//3345a7b2d964324f8f2a3bb02aaed2d819e5204a
//4e4539cf565ffa392e7258cecc397ebdf94c0470