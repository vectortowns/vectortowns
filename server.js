const properties = new require('./properties')();
const i18n = require("i18n");
const loggerLibrary = require('./libraries/logger');
const logger = loggerLibrary.logger;
const security = require('./libraries/security');
const express = require('express');
const passport = require( 'passport' );
const bodyParser = require( 'body-parser' );
const session = require( 'express-session' );
const RedisStore = require( 'connect-redis' )( session );
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const methodOverride = require('method-override');
const fs = require('fs');
const csrf = require('csurf');
const helmet = require('helmet');
const utils = require('./libraries/utils');

/*****************************************/
/*       Express app configure session       */
/*****************************************/

/* Express app */
var app = express();

/* Configure i18n */
i18n.configure({
    locales: properties.locales,
    defaultLocale: properties.defaultLocale,
    updateFiles: false,
    directory: __dirname + '/locales',

    /* setting of log level WARN - default to require('debug')('i18n:warn') */
    logWarnFn: function (msg) {
        logger.warn(msg);
    },

    /* setting of log level ERROR - default to require('debug')('i18n:error') */
    logErrorFn: function (msg) {
        logger.error(msg);
    }
});

/* Set the view engine to ejs */
app.set('view engine', 'ejs');

/* Set the i18n engine */
app.use(i18n.init);
i18n.setLocale(properties.defaultLocale);

/* catch the uncaught errors */
process.on('uncaughtException', function(err) {
    logger.error(err);
})

/* Passport session setup */
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

/* Use the GoogleStrategy within Passport */
passport.use(new GoogleStrategy({
    clientID: properties.googleAuth.clientID,
    clientSecret: properties.googleAuth.clientSecret,
    callbackURL: properties.googleAuth.callbackURL,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

var csrfProtection = csrf({ cookie: false })
app.use(helmet());
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());

app.use( session({
    secret: properties.session.secret,
    name: properties.session.name,
    store:  new RedisStore({
        host: properties.redis.host,
        port: properties.redis.port
    }),
    proxy:  true,
    resave: true,
    saveUninitialized: true,
}));

app.use( passport.initialize());
app.use( passport.session());

/* Internal application methods */
app.use(utils.manageUser);
app.use(utils.setupLocales);
app.use(security.ensureAuthorization);
app.use(utils.saveLastAccess);
app.use(utils.signedTerms);

/*****************************************/
/*         Express app routers session         */
/*****************************************/

/* Controllers */
app.use(require('./controllers'));

/* Error handler */
app.use(security.errorHandler);

/*****************************************/
/*        Express server listen session         */
/*****************************************/

app.listen(properties.server.port, function () {
    logger.info('Server started: ' + properties.server.address + ':' + properties.server.port);
});

/* For testing */
module.exports = app;