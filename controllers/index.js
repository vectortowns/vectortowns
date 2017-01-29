const express = require('express');
const router = express.Router();
const security = require('../libraries/security');
const i18n = require("i18n");
const loggerLibrary = require('../libraries/logger');
const logger = loggerLibrary.logger;
const passport = require( 'passport' );
const User = require('../models/user').User;
const Profile = require('../models/profile').Profile;
const Type = require('../models/type').Type;
const Configuration = require('../models/configuration').Configuration;

/*
    Protector of dangerous URLs
    Invalid symbols: " ' ! @ # $ % & * ( ) [ ] { } + = ` ^ ~ ; < > , | \ ? and space
*/
router.get(/["'!@#$%&*()\[\]{}+=`^~;<>,|\\? ]$/,function(req,res,next){
    var error = i18n.__('app.500.invalidURL');
    logger.error(error);
    security.render(req,res,next,'public/500', {
        error: error
    });
});

/* Index */
router.get('/', function(req, res, next) {
    var user = req.session.user;
    security.render(req, res, next, 'public/index', {});
});

/* Coming soon */
router.get('/coming-soon', function(req, res, next) {
    security.render(req, res, next, 'public/coming-soon', {});
});

/* Routers */
router.use('/profile', require('./profile'));
router.use('/login', require('./login'));
router.use('/recovery', require('./recovery'));
router.use('/log', require('./logger'));
router.use('/configure', require('./configure'));
router.use('/terms', require('./terms'));

/* GET /auth/google */
router.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

/* GET /auth/google/callback */
router.get( '/auth/google/callback',
        passport.authenticate( 'google', {
            failureRedirect: '/unauthorized'
}),function(req, res, next) {

    var email = req.user.email;
    var login = email.split("@")[0];

    /* Create user */
    var user = new User(
        undefined,
        new Type(2,'google'),
        login,
        email,
        new Profile(2,'player'),
        undefined,
        undefined,
        undefined,
        new Configuration(
            1,
            req.session.user.configuration.locale
        )
    );

    user.getOrSave(function(error,new_user){
        if (error) {
            security.render(req,res,next,'public/500', {
                error: error
            });
        } else {
            req.session.user = new_user;
            res.redirect('/');
        }
    });
});

/* Logout Passport and finish session */
router.get('/logout', function(req, res){
    var user = new User();
    user.empty();
    req.session.user = user;
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

/* 401 */
router.get('/unauthorized', function(req, res,next) {
    var user = new User();
    user.empty();
    req.session.user = user;
    security.render(req, res, next, 'public/401', {});
});

/* 404 */
router.get('/not-found', function(req, res,next) {
    var user = new User();
    user.empty();
    req.session.user = user;
    security.render(req, res, next, 'public/404', {});
});

/* 50x */
router.get('/error', function(req, res,next) {
    var user = new User();
    user.empty();
    req.session.user = user;
    security.render(req, res, next, 'public/500', { error: i18n.__('app.500.default') });
});

/* Default 404 */
router.get('*', function(req, res,next) {
    security.render(req, res, next, 'public/404', {});
});

module.exports = router;