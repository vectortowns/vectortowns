"use strict";
const properties = new require('../properties')();
const loggerLibrary = require('./logger');
const logger = loggerLibrary.logger;
const User = require('../models/user').User;
const copyUser = require('../models/user').copyUser;
const Locale = require('../models/locale').Locale;
const security = require('./security');
const i18n = require("i18n");
const db = require('./database');

/* List */

var ListDone = function(data,value,param) {
    this.data = data;
    this.value = value;
    this.param = param;
};

ListDone.prototype.done = function(callback) {
    var size = this.data.length;
    var obj = undefined;

    for (var i=0;i<size;i++) {
        if (this.data[i][this.param] === this.value) {
            obj = this.data[i];
        }
        if (i === (size - 1)) {
            callback(obj);
        }
    }
};

var ListObject = function(data, value) {
    this.data = data;
    this.value = value;
};

ListObject.prototype.withParam = function(param) {
    return new ListDone(this.data,this.value,param);
};

var List = function(data) {
    this.data = data;
};

List.prototype.getObject = function(value) {
    return new ListObject(this.data,value);
};

var CreateList = function(data) {
    return new List(data);
};

/* Locale */
function loadLocales(request, callback) {

    /* Get variables of session */
    var locales = request.session.locales;

    if (locales) {
        return callback(locales);
    } else {
        locales = [];
        (new Locale()).getAll(function(locale_error,rows){
            if (locale_error) {
                return callback([],locale_error);
            } else {
                for (var i=0;i<rows.length;i++) {
                    locales.push(rows[i]);

                    // callback
                    if (i === (rows.length - 1)) {
                        request.session.locales = locales;

                        return callback(locales);
                    }
                }
            }
        });
    }

};

var manageUser = function(request, response, next) {
    /* Create empty user, if not exists */
    if (!request.session.user) {

        /* Create empty user */
        var user = new User();
        user.empty();

        /* Save user in session */
        request.session.user = user;
        return next();
    } else {
        /* Copy user data to User Object */
        copyUser(request.session.user,function(user){
            request.session.user = user;
            return next();
        });
    }
};

var setupLocales = function(request, response, next) {
    loadLocales(request, function(locales){
        var locale = request.session.user.configuration.locale;

        if (!locale || !(locale.id && locale.description && locale.abbreviation)) {
            CreateList(locales)
                .getObject(properties.defaultLocale)
                .withParam('id')
                .done(function(obj){
                    request.session.user.configuration.locale = obj;
                    i18n.setLocale(request, obj.id);
                    return next();
                });
        } else {
            i18n.setLocale(request, locale.id);
            return next();
        }
    });
};

var saveLastAccess = function(request, response, next) {
    /* Save only if user is logged in */
    if (request.session.user && request.session.user.authenticated) {
        var type_id = request.session.user.type.id;
        var login = request.session.user.login;
        var module = request.originalUrl;
        var locale_id = request.session.user.configuration.locale.id;

        /* Call async procedure to save last access */
        db.callAsyncProcedure(
            'call save_last_access(?,?,?,?)',
            [type_id,login,module,locale_id]
        );
    }
    return next();
};

var signedTerms = function(request, response, next) {
    if (request.originalUrl === '/terms') {
        return next();
    } else if (request.originalUrl === '/logout') {
        return next();
    } else { // Other url
        var user = request.session.user;

        if (user.authenticated) { // Authenticated
            user.signedTerms(function(error,signed){
                if (error) {
                    security.render(req,res,next,'public/500', {
                        error: error
                    });
                } else {
                    if (signed) {
                        return next();
                    } else {
                        /* Save last URL */
                        user.originalUrl = request.originalUrl;
                        request.session.user = user;

                        /* Redirect to terms */
                        response.redirect('/terms');
                    }
                }
            });
        } // Authenticated
        else return next();
    } // Other url

};

module.exports = {
    CreateList: CreateList,
    manageUser: manageUser,
    setupLocales: setupLocales,
    saveLastAccess: saveLastAccess,
    signedTerms: signedTerms
};