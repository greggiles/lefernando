/**
 * Created by GGiles on 5/14/2017.
 */
var strava = require('strava-v3'),
    moment = require('moment'),
    _ = require('lodash'),
    async = require('async');
// load the auth variables
// var configAuth = require('./config/auth'); // use this one for testing
require('moment-duration-format');

var User       = require('./models/user');


var args = {
    'access_token':process.env.STRAVA_TOK,
    'id' : 0,
    'start_date_local' : '',
    'end_date_local': ''
};
var args2 = {
    'access_token':process.env.STRAVA_TOK,
    'id' : 0,
    'start_date_local' : '',
    'end_date_local': ''
};
var args3 = {
    'access_token':process.env.STRAVA_TOK,
    'id' : '5954644'
};

exports.getRide=function(user, event, cb) {

    args.athlete_id = user.strava.id;
    args2.athlete_id = user.strava.id;

    args.access_token = user.strava.token;
    args2.access_token = user.strava.token;

    async.parallel([
        function (callback) {
            strava.segments.listEfforts(args,function(err,payload,limits) {
                if(!err) {
                    // console.log(limits);
                    callback(null, payload);
                }
                else{
                    // console.log('return 1');
                    callback(err, null);

                }
            });
        },
        function (callback) {
            strava.segments.listEfforts(args2,function(err,payload,limits) {
                if(!err) {
                    // console.log(limits);
                    callback(null, payload);
                }
                else {
                    // console.log('return 2');
                    callback(err, null);
                }
            });
        }
    ], function (err,res) {
        if(err) {
            cb(err, null);
        }
        else {
            if (res[0].length > 0 ) {
                res[0].forEach(function(start) {
                    //console.log('checking ' + start.athlete.id + ' at ' + start.start_date_local);
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
                            //console.log( 'hmm ... FinishIdx is ' + finishIdx);
                        }
                    }

                    if (typeof(finishTime) != 'undefined')
                    {
                        totalTime = moment.duration(finishTime.diff(startTime, 'milliseconds'));
                        cb(null, {
                            startTime:  startTime.format('h:mm:ss.S'),
                            finishTime: finishTime.format('h:mm:ss.S'),
                            totalTime:  totalTime.format('h:mm:ss.S')
                        });
                    }
                    else {
                        cb(null, {
                            startTime:  startTime.format('h:mm:ss.S'),
                            finishTime: '',
                            totalTime:  ''
                        });

                    }
                });
            }
            else {
                cb(null, {
                    startTime:  '',
                    finishTime: '',
                    totalTime:  ''
                })
            }

        }
    });
};

exports.getRides=function(user, event, cb) {

    args.access_token = user.strava.token;
    args.athlete_id = '';
    args.id = event.seg1;
    args.start_date_local = event.date+'T'+event.time1+'Z';
    args.end_date_local = event.date+'T'+event.time2+'Z';

    if ('' != event.seg2) {
        args2.access_token = user.strava.token;
        args2.athlete_id = '';
        args2.id = event.seg2;
        args2.start_date_local = event.date+'T'+event.time3+'Z';
        args2.end_date_local = event.date+'T'+event.time4+'Z';
    }

    rides=[];

    async.parallel([
        function (callback) {
            strava.segments.listEfforts(args,function(err,payload,limits) {
                if(!err) {
                    // console.log(limits);
                    callback(null, payload);
                }
                else{
                    // console.log('return 1');
                    callback(err, null);

                }
            });
        },
        function (callback) {
            if ('' != event.seg2) {
                strava.segments.listEfforts(args2,function(err,payload,limits) {
                    if(!err) {
                        // console.log(limits);
                        callback(null, payload);
                    }
                    else {
                        // console.log('return 2');
                        callback(err, null);
                    }
                });
            }
            else
            {
                callback(null, null);
            }

        }
    ], function (err,res) {
        if(err) {
            cb(err, null);
        }
        else {
            var riderCnt = 0;
            if (res[0].length > 0 ) {
                res[0].forEach(function(start) {
                    getRiderName(start.athlete.id, user.strava.token, function(err,name){
                        if(err) start.athlete.name='err_'+err;
                        else start.athlete.name=name;

                        console.log('checking ' + start.athlete.id + ' at ' + start.start_date_local);
                        var startTime = moment(start.start_date_local);
                        var finishTime = moment(start.start_date_local).subtract(1, 'seconds');
                        var finishIdx = 0;
                        var totalTime = 0;
                        if ('' != event.seg2) {
                            while (finishIdx > -1 && finishIdx < res[1].length) {
                                finishIdx = _.findIndex(res[1], function (o) {
                                    return o.athlete.id == start.athlete.id;
                                }, finishIdx);
                                if (finishIdx > -1 && finishIdx < res[1].length) {
                                    // console.log(" -- found matching ID at IDX " + finishIdx + ' at ' + res[1][finishIdx].start_date_local  + ' that took ' + res[1][finishIdx].elapsed_time);
                                    finishTime = moment(res[1][finishIdx].start_date_local);
                                    finishTime.add(res[1][finishIdx].elapsed_time, 'seconds');
                                    if (finishTime.isAfter(startTime))
                                        break;
                                    else
                                        finishIdx++;
                                }
                                else {
                                    finishTime = undefined;
                                    //console.log( 'hmm ... FinishIdx is ' + finishIdx);
                                }
                            }
                        }
                        else {
                            finishTime = moment(start.start_date_local).add(start.elapsed_time, 'seconds');

                        }
                        if (typeof(finishTime) != 'undefined')
                        {
                            totalTime = moment.duration(finishTime.diff(startTime, 'milliseconds'));
                            rides.push( {
                                rider: start.athlete.name,
                                startTime:  startTime.format('HH:mm:ss.S'),
                                finishTime: finishTime.format('HH:mm:ss.S'),
                                totalTime:  totalTime.format('HH:mm:ss.S',  { trim: false })
                            });
                        }
                        else {
                            rides.push({
                                rider: start.athlete.name,
                                startTime:  startTime.format('h:mm:ss.S'),
                                finishTime: '',
                                totalTime:  ''
                            });

                        }

                        riderCnt++;
                        if (riderCnt == res[0].length)
                            cb(null, rides);
                    });
                });

            }
            else {
                rides.push({
                    rider: 'Nobody?',
                    startTime:  '',
                    finishTime: '',
                    totalTime:  ''
                })
                cb(null, rides);
            }

        }

    });
};

function getRiderName(id, token, cb) {
    console.log('looking for: ' + id);
    User.findOne({ 'strava.id' : id }, function(err, user) {
        if (err || null == user) {
            if (err) console.log(err);
            console.log('User not in db. Search strava for ' + id);

            strava.athletes.get({'id':id, 'access_token':token}, function (stravaErr, newAth, limits) {
                console.log('strava cb for ' + id + ' with err ' + stravaErr);
                if (stravaErr){
                    cb (stravaErr, 'strava Q Error');
                }
                else {
                    var newUser          = new User();
                    newUser.strava.id    = newAth.id;
                    // newUser.strava.token = ;
                    newUser.strava.name  = newAth.firstname + ' ' + newAth.lastname;
                    newUser.strava.email = (newAth.email || 'AutoAdded'); // pull the first email
                    // newUser.save(function(err) {
                    //     if (err)
                    //         newUser.strava.name = newUser.strava.name + '_err';
                    //     cb(null, newUser.strava.name);
                    // });
                    console.log('User ' + id + ' found in Strava with name ' + newUser.strava.name)
                    cb(null, newUser.strava.name+'_st');
                }
            });
        }
        else {
            console.log('User ' + id + ' found in DB with name ' + user.strava.name)
            cb(null,user.strava.name);
        }
    });

}