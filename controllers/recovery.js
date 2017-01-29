"use strict";
const security = require('../libraries/security');
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });
const User = require('../models/user').User;
const Profile = require('../models/profile').Profile;
const Type = require('../models/type').Type;
const Configuration = require('../models/configuration').Configuration;
const i18n = require("i18n");
const shared = require('../static/js/shared');
const properties = new require('../properties')();
const moment = require('moment-timezone');
const createPasswordRecovery = require('../models/password-recovery').createPasswordRecovery;
const PasswordRecovery = require('../models/password-recovery').PasswordRecovery;
const loggerLibrary = require('../libraries/logger');
const logger = loggerLibrary.logger;
const mailbox = require('../libraries/mailbox');

router.get('/', csrfProtection, function(req, res, next) {

    /* Create empty user */
    var user = new User();
    user.empty();

    security.render(req,res, next,'public/recovery', {
        user: user,
        validateSubmit: undefined,
        csrfToken: req.csrfToken()
    });
});

router.get('/step2/:hash', csrfProtection, function(req, res, next) {

    /* Change locale */
    i18n.setLocale(req.session.user.configuration.locale.id);

    /* Create empty user */
    var user = new User();
    user.empty();

    /* Get parameter */
    var pRecovery = new PasswordRecovery(undefined,req.params.hash);
    pRecovery.getValidRecovery(function(error,validateSubmit,passwordRecovery){
        if (error) { // Error
            security.render(req,res,next,'public/500', {
                error: error
            });
        } // Error
        else { // Found
            if (!validateSubmit.recovery.found) { // Found but with some problem
                security.render(req,res, next,'public/recovery-step2', {
                    user: user,
                    validateSubmit: validateSubmit,
                    accessHash: undefined,
                    csrfToken: undefined
                });
            } // Found but with some problem
            else { // Found and validated
                validateSubmit.recovery.found = true;

                security.render(req,res, next,'public/recovery-step2', {
                    user: user,
                    validateSubmit: validateSubmit,
                    accessHash: passwordRecovery.accessHash,
                    csrfToken: req.csrfToken()
                });
            } // Found and validated
        } // Found
    });

});


router.post('/step2', csrfProtection, function(req, res, next) {

    /* Change locale */
    i18n.setLocale(req.session.user.configuration.locale.id);

    /* Create user */
    var user = new User(
        undefined,
        new Type(1,'vectortowns'),
        undefined,
        undefined,
        new Profile(2,'player'),
        undefined,
        req.body.password,
        req.body['confirm-password'],
        new Configuration(
            1,
            req.session.user.configuration.locale
        )
    );

    /* Get parameter */
    var pRecovery = new PasswordRecovery(undefined,req.body.accessHash);
    pRecovery.getValidRecovery(function(error,validateSubmit,passwordRecovery){
        if (error) { // Error
            security.render(req,res,next,'public/500', {
                error: error
            });
        } // Error
        else { // Found
            if (!validateSubmit.recovery.found) { // Found but with some problem
                security.render(req,res, next,'public/recovery-step2', {
                    user: user,
                    validateSubmit: validateSubmit,
                    accessHash: undefined,
                    csrfToken: undefined
                });
            } // Found but with some problem
            else { // Found and validated
                validateSubmit.recovery.found = true;

                /* Get user id of passwordRecovery */
                user.id = passwordRecovery.user.id;

                user.changePassword(function(userValidateSubmit){
                    validateSubmit.password = userValidateSubmit.password;
                    validateSubmit.confirmPassword = userValidateSubmit.confirmPassword;
                    validateSubmit.error = userValidateSubmit.error;
                    validateSubmit.database = userValidateSubmit.database;

                    if (validateSubmit.database.error) {
                        security.render(req,res,next,'public/500', {
                            error: validateSubmit.database.error
                        });
                    } else { // Password changed

                        passwordRecovery.useRecovery(function(error_useRecovery){
                            if (error_useRecovery) {
                                logger.error(error_useRecovery);
                                security.render(req,res,next,'public/500', {
                                    error: error_useRecovery
                                });
                            } else { // Ok

                                security.render(req,res,next,'public/200', {
                                    message: i18n.__('app.recovery.step2.passwordChanged')
                                });

                            } // Ok

                        });

                    } // Password changed

                });

            } // Found and validated
        } // Found
    });

});

router.post('/', csrfProtection, function(req, res, next) {

    /* Change locale */
    i18n.setLocale(req.session.user.configuration.locale.id);

    /* Create user */
    var user = new User(
        undefined,
        new Type(1,'vectortowns'),
        undefined,
        req.body.email,
        new Profile(2,'player'),
        undefined,
        undefined,
        undefined,
        new Configuration(
            1,
            req.session.user.configuration.locale
        )
    );

    user.checkEmail(function(email_error,exists){
            if (email_error) {
                security.render(req,res, next,'public/recovery', {
                    user: user,
                    validateSubmit: { error: email_error },
                    csrfToken: req.csrfToken()
                });
            } else { // Email success

                if (!exists) {
                    security.render(req,res, next,'public/recovery', {
                        user: user,
                        validateSubmit: { error: i18n.__('app.recovery.error.notFound') },
                        csrfToken: req.csrfToken()
                    });
                } else { // Email found

                    user.getUserByEmail(function(user_error,new_user){
                        if (user_error) {
                            logger.error(user_error);
                            var msg = i18n.__('app.recovery.error.user');
                            logger.error(msg);

                            security.render(req,res, next,'public/recovery', {
                                user: user,
                                validateSubmit: { error: msg },
                                csrfToken: req.csrfToken()
                            });
                        } else { // User found

                            createPasswordRecovery(new_user,function(create_error,passwordRecovery){

                                if (create_error) {
                                    logger.error(create_error);

                                    security.render(req,res, next,'public/recovery', {
                                        user: user,
                                        validateSubmit: { error: create_error },
                                        csrfToken: req.csrfToken()
                                    });
                                } else { // Password recovery created

                                    passwordRecovery.save(function(save_error){
                                        if (save_error) {
                                            logger.error(save_error);
                                            logger.error(i18n.__('app.recovery.error.create'));

                                            security.render(req,res, next,'public/recovery', {
                                                user: user,
                                                validateSubmit: { error: i18n.__('app.recovery.error.create') },
                                                csrfToken: req.csrfToken()
                                            });

                                        } else { // Password Recovery saved

                                            var link = properties.email.recoveryLink + '/recovery/step2/' + passwordRecovery.accessHash;

                                            mailbox.sendRecoveryPasswordMail(
                                                new_user.login,
                                                new_user.email,
                                                link,
                                                function(email_error,response){
                                                    if (email_error) {
                                                        security.render(req,res,next,'public/500', {
                                                            error: email_error
                                                        });
                                                    } else {
                                                        logger.info('Message sent: ' + response);

                                                        /* Email sent */
                                                        security.render(req,res,next,'public/200', {
                                                            message: i18n.__('app.recovery.success')
                                                        });
                                                    }
                                            });

                                        } // Password Recovery saved
                                    });

                                } // Password recovery created

                            });

                        } // User found
                    });

                } // Email found

            } // Email success
    });

});

router.post('/checkEmail', function(req, res) {

    /* Change locale */
    i18n.setLocale(req.session.user.configuration.locale.id);

    /* Create User */
    var user = new User();
    user.email = req.body.email;
    user.type = new Type(1,'vectortowns');

    /* Return result */
    user.checkEmail(function(error,exists){
            if (error) {
                security.json(res,{
                    error: true,
                    msg: error
                });
            } else {
                if (!exists) {
                    security.json(res,{
                        error: true,
                        msg: i18n.__('app.recovery.error.notFound')
                    });
                } else {
                    security.json(res,{
                        error: undefined
                    });
                }
            }
    });

});

module.exports = router;