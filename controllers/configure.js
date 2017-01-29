"use strict";
const security = require('../libraries/security');
const express = require('express');
const router = express.Router();
const CreateList = require('../libraries/utils').CreateList;
const i18n = require("i18n");
const utils = require('../libraries/utils');
const issueTracker = require('../libraries/issue-tracker');

router.post('/issue', function(req, res){
    var data = req.body.data;

    issueTracker.createIssue(data.login,data.message,function(error){
        if (error) {
            security.json(res,{
                error: error
            });
        } else {
            security.json(res,{
                error: undefined
            });
        }
    });

});

router.post('/locale', function(req, res){
    var id = req.body.locale;
    var locales = req.session.locales;

    CreateList(locales)
        .getObject(id)
        .withParam('id')
        .done(function(obj){
            if (!obj) {
                res.status(500).send(JSON.stringify({
                    error: true,
                    msg: i18n.__('app.500.invalidLocale')
                }));
            } else {
                /* Update session */
                req.session.user.configuration.locale = obj;

                /* Change locale */
                req.setLocale(obj.id);

                res.status(200).send(JSON.stringify({
                    msg: i18n.__('app.200.validLocale')
                }));
            }
        });
});

module.exports = router;