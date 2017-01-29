const i18n = require("i18n");
const db = require('../libraries/database');

var Configuration = function(receiveEmails,locale) {
    this.receiveEmails = receiveEmails;
    this.locale = locale;
};

Configuration.prototype.save = function(user_id,callback) {
    var sql = 'insert into configuration (user_id, locale_id) value (?,?)';
    var data = [user_id,this.locale.id];
    db.executeQuery(sql,data,function(error,result){
        if (error) {
            return callback(error);
        } else {
            return callback();
        }
    });
};

module.exports = {
    Configuration: Configuration
};