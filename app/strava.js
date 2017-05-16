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

var eventIdx = 1;   //0-brighton
                    //1-JETT

var test = {
    date: '2017-05-15',
    time1: '18:55:00',
    time2: '19:20:00',
    time3: '19:20:00',
    time4: '21:00:00',
    seg1: ['7815469', '5954636'],
    seg2: ['6076569', '5954644']
};

var args = {
    'access_token':process.env.STRAVA_TOK,
    'id' : test.seg1[eventIdx],
    'start_date_local' : test.date+'T'+test.time1+'Z',
    'end_date_local': test.date+'T'+test.time2+'Z'
};
var args2 = {
    'access_token':process.env.STRAVA_TOK,
    'id' : test.seg2[eventIdx],
    'start_date_local' : test.date+'T'+test.time3+'Z',
    'end_date_local': test.date+'T'+test.time4+'Z'
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

    args.athlete_id = '';
    args2.athlete_id = '';

    args.access_token = user.strava.token;
    args2.access_token = user.strava.token;

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
            var riderCnt = 0;
            if (res[0].length > 0 ) {
                res[0].forEach(function(start) {
                    getRiderName(start.athlete.id, user.strava.token, function(err,name){
                        if(err) start.athlete.name='err_'+err;
                        else start.athlete.name=name;

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
                                //console.log( 'hmm ... FinishIdx is ' + finishIdx);
                            }
                        }

                        if (typeof(finishTime) != 'undefined')
                        {
                            totalTime = moment.duration(finishTime.diff(startTime, 'milliseconds'));
                            rides.push( {
                                rider: start.athlete.name,
                                startTime:  startTime.format('h:mm:ss.S'),
                                finishTime: finishTime.format('h:mm:ss.S'),
                                totalTime:  totalTime.format('h:mm:ss.S')
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