const i18n = require("i18n");
const moment = require('moment-timezone');
const randomstring = require("randomstring");
const db = require('../libraries/database');
const properties = new require('../properties')();
const security = require('../libraries/security');
const User = require('./user.js').User;
const shared = require('../static/js/shared');

var PasswordRecovery = function(user,accessHash,requestDate,deadlineDate,useDate,disabled) {
    this.user = user;
    this.accessHash = accessHash;
    this.requestDate = requestDate;
    this.deadlineDate = deadlineDate;
    this.useDate = useDate;
    this.disabled = disabled;

    if (!this.disabled) {
        this.disabled = false;
    }
}

var createPasswordRecovery = function(user,callback) {
    if (user && user.id && user.email) {
        var requestDate = moment(Date.now()).tz(properties.timezone);
        var deadlineDate = moment(Date.now()).tz(properties.timezone).add(properties.recoveryPassword.delay, 'hours');
        var string = requestDate.format() + randomstring.generate() + user.email.toUpperCase();

        security.hash(string,function(accessHash){
            return callback(undefined,new PasswordRecovery(user,accessHash,requestDate,deadlineDate));
        });

    } else {
        return callback(i18n.__('app.recoveryPassword.createMe.notFound'));
    }
};

PasswordRecovery.prototype.save = function(callback) {
    var self = this;

    /* Whenever a new record is created, the others must be deactivated. */
    var updateSql = 'update password_recovery set disabled=true where user_id = ?';
    var updateData = [
        self.user.id
    ];
    db.executeQuery(updateSql,updateData,function(error,result){
        if (error) {
            return callback(error);
        } else {

            /* Insert new record */
            var insertSql = 'insert into password_recovery (user_id,access_hash,request_date,deadline_date) values (?,?,?,?)';
            var insertData = [
                self.user.id,
                self.accessHash,
                self.requestDate.format('YYYY-MM-DD HH:mm:ss'),
                self.deadlineDate.format('YYYY-MM-DD HH:mm:ss')
            ];
            db.executeQuery(insertSql,insertData,function(error,result){
                if (error) {
                    return callback(error);
                } else {
                    return callback();
                }
            });

        }
    });
};

PasswordRecovery.prototype.useRecovery = function(callback) {
    var self = this;

    /* Whenever a new record is created, the others must be deactivated. */
    var updateSql = 'update password_recovery set use_date = now() where user_id = ? and access_hash = ?';
    var updateData = [self.user.id,self.accessHash];
    db.executeQuery(updateSql,updateData,function(error,result){
        if (error) {
            return callback(error);
        } else {
            return callback();
        }
    });
};

PasswordRecovery.prototype.getValidRecovery = function(callback) {
    /* Validate result */
    var validateSubmit = shared.getRecoveryValidateResult();

    security.safeParam(this.accessHash,function(hash,error){
        if (error) return callback(error);
        else { // Param ok
            get(hash,function(get_error,passwordRecovery){
                if (get_error) { // Error in search of recovery
                    logger.error(get_error);
                    return callback(get_error);
                } // Error in search of recovery
                else {
                    if (!passwordRecovery) { // Not found
                        validateSubmit.recovery.error = i18n.__('app.recovery.step2.notFound');
                        return callback(undefined,validateSubmit);
                    } // Not found
                    else { // Found
                        if (passwordRecovery.useDate) { // Already used
                            validateSubmit.recovery.error = i18n.__('app.recovery.step2.alreadyUsed');
                            return callback(undefined,validateSubmit);
                        } // Already used
                        else { // Not used
                            if (moment(Date.now()).isAfter(passwordRecovery.deadlineDate)) { // Request is expired
                                validateSubmit.recovery.error = i18n.__('app.recovery.step2.requestExpired');
                                return callback(undefined,validateSubmit);
                            } // Request is expired
                            else { // Not expired

                                if (passwordRecovery.disabled) { // disabled
                                    validateSubmit.recovery.error = i18n.__('app.recovery.step2.disabled');
                                    return callback(undefined,validateSubmit);
                                } // disabled
                                else { // OK
                                    validateSubmit.recovery.found = true;
                                    return callback(undefined,validateSubmit,passwordRecovery);
                                } // OK
                            } // Not expired
                        } // Not used
                    } // Found
                }
            });
        } // Param ok
    });
};

 function get(accessHash,callback) {
    sql = "select * from password_recovery where access_hash = ?";
    var data = [accessHash];
    db.executeQuery(sql, data, function(error,rows){
        if (error) {
            return callback(error);
        } else { // Query ok
            if (rows.length == 1) {
                return callback(undefined,new PasswordRecovery(
                    new User(rows[0].user_id),
                    rows[0].access_hash,
                    db.convertToMoment(rows[0].request_date),
                    db.convertToMoment(rows[0].deadline_date),
                    db.convertToMoment(rows[0].use_date),
                    rows[0].disabled
                ));
            } else if (rows.length > 1) {
                return callback(i18n.__('app.recovery.step2.error.notFound'));
            } else {
                return callback(undefined,undefined);
            }
        } // Query ok
    });
};

module.exports = {
    PasswordRecovery: PasswordRecovery,
    createPasswordRecovery: createPasswordRecovery
};