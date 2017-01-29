const security = require('../libraries/security');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });
const loggerLibrary = require('../libraries/logger');
const logger = loggerLibrary.logger;
const i18n = require("i18n");
const User = require('../models/user').User;

router.get('/', csrfProtection, function(req, res, next) {

    /* Create validate submit message */
    var validateSubmit = {
        error: undefined
    };

    security.render(req,res, next,'public/login', {
        validateSubmit: validateSubmit,
        csrfToken: req.csrfToken()
    });
});

router.post('/', csrfProtection, security.checkCSRF, function(req, res, next) {

    /* Change locale */
    i18n.setLocale(req.session.user.configuration.locale.id);

    /* Get last URL */
    var originalUrl = req.session.user.originalUrl;

    /* Create validate submit message */
    var validateSubmit = {
        error: undefined
    };

    /* Create empty user */
    var user = new User();
    user.empty();
    user.email = req.body.email;
    user.password = req.body.password;

    user.authenticate(function(error,user_found){
        if (error) {
            logger.error(error);
            validateSubmit.error = error;

            security.render(req,res,next,'public/login', {
                user: user,
                validateSubmit: validateSubmit,
                csrfToken: req.csrfToken()
            });
        } else {
            req.session.user = user_found;
            if (originalUrl) {
                res.redirect(originalUrl);
            } else {
                security.render(req, res, next, 'public/index', {});
            }
        }
    });

});

module.exports = router;