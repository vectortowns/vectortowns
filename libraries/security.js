"use strict";
const i18n = require("i18n");
const properties = new require('../properties')();
const loggerLibrary = require('./logger');
const logger = loggerLibrary.logger;
const crypto = require('crypto');
const Locale = require('../models/locale').Locale;
const shared = require('../static/js/shared');
const Pages = require('../models/page');

var errorHandler = function(error, request, response, next) {
    if(!error) return next();
    logger.error(error);

    var json = {error: error};
    json.staticServer = properties.staticServer.host;
    json.nodeServer = properties.nodeServer.host;
    json.locales = request.session.locales;
    json.locale = request.session.user.configuration.locale;
    json.termsFile = '../partials/terms/' + request.session.user.configuration.locale.abbreviation;
    json.materialize = properties.materialize;
    json.user = request.session.user;

    response.render('public/500', json);
};

var checkCSRF = function(error, req, res, next) {
    if(!error) return next();
    if (error.code === 'EBADCSRFTOKEN') {
        render(req,res,next,'public/403', {
            error: error
        });
    }
};

var ensureAuthorization = function(req, res, next) {
    if (process.env.NODE_ENV === 'test') return next();

    Pages.ensureAuthorization(req.session.user,req.originalUrl,function(canAccess){
        if (canAccess) {
            return next();
        } else {
            if (req.session.user.authenticated) { /* No access and no authentication */
                res.redirect('/unauthorized');
            } else { /* Without access and with authentication */
                req.session.user.originalUrl = req.originalUrl;
                res.redirect('/login');
            }
        }
    });
};

var safeParam = function(param,callback) {
    if (shared.validateSafeParam(param)) {
        callback(param);
    } else {
        var error = i18n.__('app.500.insecureParam %s',param);
        callback(param,error);
    }
};

var render = function(request,response, next, url, json) {
    json.staticServer = properties.staticServer.host;
    json.nodeServer = properties.nodeServer.host;
    json.locales = request.session.locales;
    json.locale = request.session.user.configuration.locale;
    json.termsFile = '../partials/terms/' + request.session.user.configuration.locale.abbreviation;
    json.materialize = properties.materialize;
    json.user = request.session.user;

    response.render(url, json, function(error,html){
        if (!error)
            response.send(html);
        else {
            logger.error(error);
            response.send(html);
        }
    });
};

var json = function(response, json) {
    response.setHeader('Content-Type', 'application/json');
    response.end( JSON.stringify(json) );
};

var hash = function(password,callback) {
    return callback(crypto.createHash('sha512').update(password).digest('hex'));
};

module.exports = {
    errorHandler: errorHandler,
    checkCSRF: checkCSRF,
    ensureAuthorization: ensureAuthorization,
    safeParam: safeParam,
    render: render,
    json: json,
    hash: hash
};