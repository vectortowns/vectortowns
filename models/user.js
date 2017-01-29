const i18n = require("i18n");
const db = require('../libraries/database');
const Profile = require('./profile').Profile;
const properties = new require('../properties')();
const Configuration = require('./configuration').Configuration;
const Locale = require('./locale').Locale;
const LastAccess = require('./last-access').LastAccess;
const Type = require('./type').Type;
const shared = require('../static/js/shared');
const security = require('../libraries/security');
const meter = require('../static/js/meter');
const loggerLibrary = require('../libraries/logger');
const logger = loggerLibrary.logger;
const moment = require('moment-timezone');

var copyUser = function(clone,callback) {
    /* Create user */
    var user = new User(
        clone.id,
        clone.type,
        clone.login,
        clone.email,
        clone.profile,
        clone.agreementTerms,
        clone.password,
        clone.confirmPassword,
        clone.configuration
    );
    user.authenticated = clone.authenticated;
    user.originalUrl = clone.originalUrl;
    callback(user);
};

var User = function(id,type,login,email,profile,agreementTerms,password,confirmPassword,configuration) {
    this.id = id;
    this.type = type;
    this.login = login;
    this.email = email;
    this.profile = profile;
    this.agreementTerms = agreementTerms;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.configuration = configuration;

    /* Others */
    this.authenticated = false;
    this.originalUrl = undefined;
};

User.prototype.empty = function() {
    this.id = undefined;
    this.type = new Type(1,'vectortowns');
    this.login = '';
    this.email = '';
    this.profile = new Profile(2,'player');
    this.termsAcceptedIn = undefined;
    this.password = '';
    this.confirmPassword = '';
    this.configuration = new Configuration(1,new Locale(properties.defaultLocale));
    return;
};

/* Log in */
User.prototype.authenticate = function(callback) {
    var self = this;

    validateEmail(self.email,function(error_email){
        if (error_email) {
            return callback(error_email);
        } else { // Email ok

            if ( (!self.password) || (self.password.length == 0) ) {
                return callback(i18n.__('app.login.error.password'));
            } else { // Password ok

                hashUserPassword(self.type.id,self.password,function(hashPassword){ // hash password

                    var sql = 'select user.id as uid, type.id as tid, type.description as tdescription, login, email, agreement_terms as agreement, profile.id as pid, profile.description as pdescription, receive_emails, locale.id as lid, locale.description as ldescription, abbreviation from user inner join profile on profile.id = user.profile_id inner join type on type.id = user.type_id left join configuration on configuration.user_id = user.id left join locale on locale.id = configuration.locale_id where type_id = 1 and email = ? and password = ?';
                    var data = [self.email,hashPassword];

                    db.executeQuery(sql,data,function(error_db,rows){ // query
                        if (error_db) {
                            return callback(error_db);
                        } else {
                            if (rows.length == 1) {

                                var user_found = new User(
                                    rows[0].uid,
                                    new Type(rows[0].tid,rows[0].tdescription),
                                    rows[0].login,
                                    rows[0].email,
                                    new Profile(rows[0].pid,rows[0].pdescription),
                                    rows[0].agreement,
                                    undefined,
                                    undefined,
                                    new Configuration(
                                        rows[0].receive_emails,
                                        new Locale(rows[0].lid,rows[0].ldescription,rows[0].abbreviation)
                                    )
                                );
                                user_found.authenticated = true;
                                return callback(undefined,user_found);

                            } else if (rows.length > 1) {
                                return callback(i18n.__('app.user.manyUsersFound'));
                            } else {
                                return callback(i18n.__('app.login.error.message'));
                            }
                        }
                    }); // query

                }); // hash password

            } // Password ok

        } // Email ok

    });

};

/* Change password */
User.prototype.changePassword = function(callback) {
    var self = this;

    /* Validate result */
    var validateSubmit = shared.getUserValidateResult();

    User.prototype.checkPassword.call(self,function(score,errorPassword,errorConfirmPassword,success){

        /* Save password result */
        validateSubmit.password = {
            error: errorPassword,
            typed: true,
            score: score
        };

        /* Save confirm password result */
        validateSubmit.confirmPassword = {
            error: errorConfirmPassword,
            typed: true
        };

        /* Since passwords are cleared after POST, you must adapt the result */
        if (validateSubmit.confirmPassword.error) {
            validateSubmit.password.typed = false;
        }

        /* Exists error in user data? */
        if (validateSubmit.password.error || validateSubmit.confirmPassword.error) {
            validateSubmit.error = true;

            /* Clear passwords */
            self.password = '';
            self.confirmPassword = '';

            /* Invalid */
            return callback(validateSubmit);

        } else { // Valid

            hashUserPassword(self.type.id,self.password,function(hashPassword){ // hash password

                var sql = 'update user set password = ? where id = ?';
                var data = [hashPassword,self.id];

                db.executeQuery(sql,data,function(error_update,result){
                    if (error_update) {
                        validateSubmit.error = true;
                        validateSubmit.database.error = error_update;
                        logger.error(error_update);

                        return callback(validateSubmit);
                    } else { // Update

                        if (result.changedRows != 1) { // Many records updated
                            /*
                                A record was framed in the "where", but the user changed the password to the same
                                value that was already in the database. This is why the database returned stating tha
                                 no rows were changed.
                            */
                            if (result.affectedRows == 1) { // Password is the same
                                return callback(validateSubmit);
                            } // Password is the same
                            else { // Error
                                validateSubmit.error = true;
                                validateSubmit.database.error = i18n.__('app.recovery.step2.error.passwordChanged');
                                logger.error(validateSubmit.database.error);
                                return callback(validateSubmit);
                            } // Error
                        } // Many records updated
                        else { // Update ok
                            return callback(validateSubmit);
                        } // Update ok

                    } // Update
                });

            }); // hash password

        } // Valid

    });
};

User.prototype.getOrSave = function(callback) {
    var self = this;
    getUser(self.login,undefined,self.type.id,function(error,user_found){
        if (error) {
            return callback(error);
        } else {
            if (user_found) {
                user_found.id = undefined;
                user_found.authenticated = true;
                return callback(undefined,user_found);
            } else {
                User.prototype.save.call(self,function(validateSubmit,new_user){

                    /* Exists error? */
                    var error_validate = undefined;
                    if (validateSubmit.login.error) {
                        error_validate = validateSubmit.login.error;
                    } else if (validateSubmit.email.error) {
                        error_validate = validateSubmit.email.error;
                    } else if (validateSubmit.error) {
                        error_validate = validateSubmit.error;
                    } else if (validateSubmit.database.error) {
                        error_validate = validateSubmit.database.error;
                    }

                    if (error_validate) {
                        return callback(error_validate);
                    } else {
                        new_user.id = undefined;
                        new_user.authenticated = true;
                        return callback(undefined,new_user);
                    }

                });
            }
        }
    });
};

/* Save User in database */
User.prototype.save = function(callback) {
    var self = this;

    /* Validate result */
    var validateSubmit = shared.getUserValidateResult();

    /* Validate login */
    User.prototype.checkLogin.call(self,function(jsonLogin){
        if (jsonLogin.error) {
            validateSubmit.login.error = jsonLogin.msg;
        }

        /* Validate email */
        User.prototype.checkEmail.call(self,function(check_email_error,exists){
            if (check_email_error) {
                validateSubmit.email.error = check_email_error;
            }

            /* Validate password */
            User.prototype.checkPassword.call(self,function(score,errorPassword,errorConfirmPassword,success){

                /* Save password result */
                validateSubmit.password = {
                    error: errorPassword,
                    typed: true,
                    score: score
                };

                /* Save confirm password result */
                validateSubmit.confirmPassword = {
                    error: errorConfirmPassword,
                    typed: true
                };

                /* Since passwords are cleared after POST, you must adapt the result */
                if (validateSubmit.confirmPassword.error) {
                    validateSubmit.password.typed = false;
                }

                /* Exists error in user data? */
                if (validateSubmit.login.error || validateSubmit.email.error || validateSubmit.password.error || validateSubmit.confirmPassword.error) {
                    validateSubmit.error = true;

                    /* Clear passwords */
                    self.password = '';
                    self.confirmPassword = '';

                    /* Invalid User */
                    return callback(validateSubmit);

                } else { // end - Exists error in user data?
                    /* Valid User */

                    hashUserPassword(self.type.id,self.password,function(hashPassword){

                        /* Vectortowns acount */
                        var sql = 'insert into user (type_id,login,email,profile_id,password) values (?,?,?,?,?)';
                        var data = [self.type.id,self.login,self.email,self.profile.id,hashPassword];

                        /* Google acount */
                        if (self.type.id === 2) {
                            sql = 'insert into user (type_id,login,email,profile_id) values (?,?,?,?)';
                            data = [self.type.id,self.login,self.email,self.profile.id];
                        }

                        db.executeQuery(sql,data,function(insert_error,rows){
                            if (insert_error) {
                                logger.error(insert_error);
                                validateSubmit.database.error = i18n.__('app.profile.insert.error');
                                return callback(validateSubmit);
                            } else { // insert_error
                                getUser(self.login,undefined,self.type.id,function(user_error,new_user){
                                    if (user_error) {
                                        logger.error(insert_error);
                                        validateSubmit.database.error = user_error;
                                    } else { // user_error

                                        /* Configuration */
                                        var configuration = self.configuration;

                                        configuration.save(new_user.id,function(configuration_error){
                                            if (configuration_error) {
                                                logger.error(configuration_error);
                                                validateSubmit.database.error = configuration_error;
                                            } else { // configuration_error

                                                /* Last access */
                                                var lastAccess = new LastAccess(new_user,'/profile');
                                                lastAccess.save(function(last_access_error){
                                                    if (last_access_error) {
                                                        logger.error(last_access_error);
                                                        validateSubmit.database.error = last_access_error;
                                                    } else { // last_access_error

                                                        /* Clear id */
                                                        new_user.id = undefined;
                                                        new_user.configuration = configuration;
                                                        new_user.authenticated = true;

                                                        /* Data saved */
                                                        return callback(validateSubmit,new_user);

                                                    } // else last_access_error
                                                }); // save lastAccess

                                            } // configuration_error

                                        }); // save configuration

                                    } // else user_error
                                }); // getUser
                            } // else insert_error
                        }); // executeQuery to insert user

                    }); // security.hash

                } // else - Exists error in user data?

            }); // User.prototype.checkPassword
        }); // User.prototype.checkEmail
    }); // User.prototype.checkLogin

}; // User.prototype.save

User.prototype.checkLogin = function(callback) {

    /* Login exits? */
    if ( ! this.login ) {
        return callback({
            error: true,
            msg: i18n.__('app.profile.login.error.notFound')
        });
    }
    var type_id = this.type.id;

    /* Verify characters */
    security.safeParam(this.login,function(login,error){
        if (error) {
            return callback({
                error: true,
                msg: i18n.__('app.profile.login.error.char')
            });
        } else {

            /* Is login valid? */
            validateLogin(login,function(error){
                if (error) {
                    return callback({
                        error: true,
                        msg: error
                    });
                } else {

                    /* Is the login being used? */
                    loginExists(type_id,login,function(error,success){
                        if (error) {
                            return callback({
                                error: true,
                                msg: error
                            });
                        } else {
                            return callback({msg: success});
                        }
                    });

                }
            });

        }
    });

};

User.prototype.checkEmail = function(callback) {

    if ( ! this.email ) {
        return callback(i18n.__('app.profile.email.error.notFound'));
    }
    var type_id = this.type.id;
    var email = this.email;

    /* Is email valid? */
    validateEmail(email,function(email_error){
        if (email_error) {
            return callback(email_error);
        } else {

            /* Is the email being used? */
            emailExists(type_id,email,function(error_exists,exists){
                if (error_exists) {
                    return callback(error_exists);
                } else {
                    return callback(undefined,exists);
                }
            });

        }
    });
};

User.prototype.checkPassword = function(callback) {
    /* Users with google acount do not have password */
    if (this.type.id == 2) {
        return callback(0,false,undefined,i18n.__('app.profile.google.withoutPassword'));
    }

    /* Calculate meter of password */
    var score = meter(this.password).score;

    /* Validate password */
    if (!shared.validatePassword(score)) {
        return callback(score,true);
    } else {
        /* Validate confirm password */
        if (!shared.validateConfirmPassword(this.password,this.confirmPassword)) {
            return callback(score,false,i18n.__('app.profile.confirm.error'));
        } else {
            return callback(score,false,undefined,i18n.__('app.profile.confirm.success'));
        }
    }
};

User.prototype.acceptedTerms = function(checked,callback) {
    var validateSubmit = {
        error: true,
        database: {
            error: undefined
        }
    };
    if (!checked) {
        return callback(validateSubmit);
    } else {
        validateSubmit.error = false;
        this.agreementTerms = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        var sql = 'update user set agreement_terms = ? where login=? and type_id=?';
        var data = [
            this.agreementTerms,
            this.login,
            this.type.id
        ];

        db.executeQuery(sql,data,function(error,result){
            if (error) {
                logger.error(error);
                validateSubmit.database.error = error;
                return callback(validateSubmit);
            } else {
                if (result.changedRows != 1) {
                    validateSubmit.database.error = i18n.__('app.user.updateTerms');
                    logger.error(validateSubmit.database.error);
                    return callback(validateSubmit);
                } else {
                    return callback(validateSubmit);
                }
            }
        });
    }
};

User.prototype.signedTerms = function(callback) {

    var sql = 'select agreement_terms from user where agreement_terms is not null and login=? and type_id=?';
    var data = [
        this.login,
        this.type.id
    ];

    db.executeQuery(sql,data,function(error,rows){
        if (error) {
            logger.error(error);
            return callback(error);
        } else {
            if (rows.length == 0) {
                return callback(undefined,false);
            } else {
                return callback(undefined,true);
            }
        }
    });
};

User.prototype.getUserByEmail = function(callback) {
    getUser(undefined,this.email,this.type.id,function(error,new_user){
        if (error) {
            return callback(error);
        } else {
            return callback(undefined,new_user);
        }
    });
};

/* Private functions */

function emailExists(type_id, email, callback) {
    var sql = 'select email from user where type_id=? and email = ?';
    var data = [type_id,email];
    db.executeQuery(sql,data,function(error,rows){
        if (error) {
            return callback(error);
        } else {
            if (rows.length) {
                return callback(undefined,true);
            } else {
                return callback(undefined,false);
            }
        }
    });
};

function validateEmail(email,callback) {
    if ( !shared.validateEmail(email) ) {
        return callback(i18n.__('app.profile.email.error.invalid'));
    }
    return callback();
};

function loginExists(type_id,login,callback) {
    var sql = 'select login from user where type_id=? and login = ?';
    var data = [type_id,login];
    db.executeQuery(sql,data,function(error,rows){
        if (error) {
            return callback(error);
        } else {
            if (rows.length) {
                return callback(i18n.__('app.profile.login.error.found'));
            } else {
                return callback(undefined,i18n.__('app.profile.login.success'));
            }
        }
    });
};

function validateLogin(login,callback) {
    if (!shared.validateLogin(login)) {
        return callback(i18n.__('app.profile.login.error.size'));
    }
    return callback();
};

function getUser(login,email,type_id,callback) {
    var columnName = '';
    var data = [];

    if (login) {
        columnName = 'login';
        data.push(login);
    } else {
        columnName = 'email';
        data.push(email);
    }
    /* Type of user */
    data.push(type_id);

    var sql = 'select user.id as uid, type.id as tid, type.description as tdescription, login, email, agreement_terms as agreement, profile.id as pid, profile.description as pdescription, receive_emails, locale.id as lid, locale.description as ldescription, abbreviation from user inner join profile on profile.id = user.profile_id inner join type on type.id = user.type_id left join configuration on configuration.user_id = user.id left join locale on locale.id = configuration.locale_id where ' + columnName + ' = ? and type_id = ?';

    db.executeQuery(sql,data,function(error,rows){
        if (error) {
            return callback(error);
        } else {
            if (rows.length == 1) {
                return callback(undefined,new User(
                    rows[0].uid,
                    new Type(rows[0].tid,rows[0].tdescription),
                    rows[0].login,
                    rows[0].email,
                    new Profile(rows[0].pid,rows[0].pdescription),
                    rows[0].agreement,
                    undefined,
                    undefined,
                    new Configuration(
                        rows[0].receive_emails,
                        new Locale(rows[0].lid,rows[0].ldescription,rows[0].abbreviation)
                    )
                ));

            } else if (rows.length > 1) {
                return callback(i18n.__('app.user.manyUsersFound'));
            } else {
                return callback(undefined,undefined);
            }
        }
    });
};

function hashUserPassword(type_id,password,callback) {
    if (type_id === 2) {
        return callback();
    } else {
        security.hash(password,function(hashPassword){
            return callback(hashPassword);
        });
    }
};

module.exports = {
    User: User,
    copyUser: copyUser
};