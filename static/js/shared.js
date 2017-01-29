"use strict";

(function(exports){

    exports.validateEmail = function(email) {
        if ( (typeof email == 'undefined')  || email === undefined || email === "") return false;
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    exports.validateSafeParam = function(param) {
        var regexp = /^[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*$/;
        return regexp.test(param);
    };

    exports.validateLogin = function(login) {
        if (login.length < 4 || login.length > 30) {
            return false;
        } else {
            return true;
        }
    };

    exports.validatePassword = function(score) {
        if (score > 0) {
            return true;
        }
        return false;
    };

    exports.validateConfirmPassword = function(password,confirmPassword) {
        if ( (typeof password != 'undefined')  && password !== undefined && password !== "") {
            if ( (typeof confirmPassword != 'undefined')  && confirmPassword !== undefined && confirmPassword !== "") {
                return (password === confirmPassword);
            }
        }
        return false;
    };

    exports.getUserValidateResult = function() {
        return {
            login: { error: undefined },
            email: { error: undefined },
            password: {
                error: false,
                typed: false,
                score: 0
            },
            confirmPassword: {
                error: undefined,
                typed: false
            },
            error: false,
            database: {
                error: undefined
            }
        };
    };

    exports.getRecoveryValidateResult = function() {
        return {
            password: {
                error: false,
                typed: false,
                score: 0
            },
            confirmPassword: {
                error: undefined,
                typed: false
            },
            error: false,
            database: {
                error: undefined
            },
            recovery: {
                found: false,
                error: undefined
            }
        };
    };

})(typeof exports === 'undefined'? this['shared']={}: exports);