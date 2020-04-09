"use strict";
const util = require('util');
const passport = require("passport");
const express = require("express");
const http = require('http');
var app = express();
var server = http.createServer(app);
const passportSaml = require('passport-saml').Strategy;

//Passport SAML
passport.use(new passportSaml({
        path: '/login',
        entryPoint: 'https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php',
        issuer: 'passport-saml'
    },
    function(profile, done) {
        findByEmail(profile.email, function(err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user);
        });
    }));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));


app.get('/login', function(req, res) {
    res.render('index', {
        user: req.user
    });
});

app.get('/account', ensureAuthenticated, function(req, res) {
    res.render('account', {
        user: req.user
    });
});

app.get('/',
    passport.authenticate('saml', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    function(req, res) {
        res.redirect('/account');
    }
);
app.post('/login/callback',
    passport.authenticate('saml', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    function(req, res) {
        res.redirect('/account');
    }
);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(1123);


// Simple route middleware to ensure user is authenticated.

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}