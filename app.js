/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com

var express = require('express');
var accessToken;

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var path = require('path');
var fs = require('fs');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// initialize the Fitbit API client
var FitbitApiClient = require("fitbit-node"),
    client = new FitbitApiClient("227WZZ", "809c60db91c332b6f62c51934d630066");

// redirect the user to the Fitbit authorization page
app.get("/authorize", function (req, res) {
    // request access to the user's activity, heartrate, location, nutrion, profile, settings, sleep, social, and weight scopes
    res.redirect(client.getAuthorizeUrl('activity heartrate location nutrition profile settings sleep social weight', 'http://localhost:6001/call'));
});

// handle the callback from the Fitbit authorization flow
app.get("/call", function (req, res) {
  console.log(req.query.code);

   

    // exchange the authorization code we just received for an access token
    client.getAccessToken(req.query.code, 'http://localhost:6001/call').then(function (result) {
        // use the access token to fetch the user's profile information
        accessToken = result.access_token;
        client.get("/profile.json", result.access_token).then(function (results) {
            //res.json(results[0]);

            res.render('call',{data: JSON.stringify(results[0]['user']['age'])});

        });
    }).catch(function (error) {
        res.send(error);
    });
});

app.get("/heartrate",function (req, res) {


    // exchange the authorization code we just received for an access token

        // use the access token to fetch the user's heart rate information
        client.get("/activities/heart/date/today/1m.json", accessToken).then(function (results) {
            //res.send(results[0]);

            res.render('hear',{data: JSON.stringify(results[0])});

        }).catch(function (error) {
        res.send(error);
    });

});

app.get("/stepscount",function (req, res) {


    // exchange the authorization code we just received for an access token

    // use the access token to fetch the user's heart rate information
    client.get("/activities/steps/date/today/1m.json", accessToken).then(function (results) {
        //res.send(results[0]);

        res.render('hear',{data: JSON.stringify(results[0])});

    }).catch(function (error) {
        res.send(error);
    });

});






// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
