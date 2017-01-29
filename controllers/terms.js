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

    /* Get user */
    var user = req.session.user;

    /* Change locale */
    i18n.setLocale(req.session.user.configuration.locale.id);

    /* Verify that the terms have already been signed */
    if (user.agreementTerms) {
        security.render(req,res,next,'public/500', {
            error: i18n.__('app.terms.already.signed')
        });
    } else {
        security.render(req,res, next,'private/terms', {
            user: user,
            validateSubmit: undefined,
            csrfToken: req.csrfToken()
        });
    }

});

router.post('/', csrfProtection, function(req, res, next) {

    var user = req.session.user;
    var checked = req.body.terms;

    user.acceptedTerms(checked,function(validateSubmit){
        if (validateSubmit.error) {
            security.render(req,res, next,'private/terms', {
                user: req.session.user,
                validateSubmit: validateSubmit,
                csrfToken: req.csrfToken()
            });
        } else {
            if (validateSubmit.database.error) {
                security.render(req,res,next,'public/500', {
                    error: validateSubmit.database.error
                });
            } else {
                if (user.originalUrl) {
                    res.redirect(user.originalUrl);
                } else {
                    security.render(req, res, next, 'public/index', {});
                }
            }
        }
    });

});

module.exports = router;