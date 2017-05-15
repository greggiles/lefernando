// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'stravaAuth' : {
        'clientID'         : process.env.STRAVA_CLIENT_ID || '00001',
        'clientSecret'     : process.env.STRAVA_CLIENT_SECRET || 'mystravaclientsecret',
        'callbackURL'      : '/auth/strava/callback'
    }

};
