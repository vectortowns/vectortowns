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

router.get('/', csrfProtection, function(req, res, next) {

    /* Create empty user */
    var user = new User();
    user.empty();

    security.render(req,res, next,'public/profile', {
        user: user,
        validateSubmit: false,
        csrfToken: req.csrfToken()
    });
});

router.post('/', csrfProtection, function(req, res, next) {

    /* Create user */
    var user = new User(
        undefined,
        new Type(1,'vectortowns'),
        req.body.login,
        req.body.email,
        new Profile(2,'player'),
        undefined,
        req.body.password,
        req.body['confirm-password'],
        new Configuration(
            1,
            req.session.user.configuration.locale
        )
    );

    user.save(function(validateSubmit,new_user){
        if (validateSubmit.error) {
            security.render(req,res, next,'public/profile', {
                user: user,
                validateSubmit: validateSubmit,
                csrfToken: req.csrfToken()
            });
        } else {

            if (validateSubmit.database.error) {
                security.render(req,res,next,'public/500', {
                    error: validateSubmit.database.error
                });
            } else {
                req.session.user = new_user;
                security.render(req,res, next,'private/terms', {
                    user: new_user,
                    validateSubmit: undefined,
                    csrfToken: req.csrfToken()
                });
            }

        }
    });

});

router.post('/checkLogin', function(req, res) {

    /* Change locale */
    i18n.setLocale(req.session.user.configuration.locale.id);

    /* Create User */
    var user = new User();
    user.login = req.body.login;
    user.type = new Type(1,'vectortowns');

    /* Return result */
    user.checkLogin(function(json){
        security.json(res,json);
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
                if (exists) {
                    security.json(res,{
                        error: true,
                        msg: i18n.__('app.profile.email.error.found')
                    });
                } else {
                    security.json(res,{
                        msg: i18n.__('app.profile.email.success')
                    });
                }
            }
    });

});

module.exports = router;