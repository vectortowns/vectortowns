const i18n = require("i18n");
const db = require('../libraries/database');

var LastAccess = function(user,module,timestamp) {
    this.user = user;
    this.module = module;
    this.timestamp = timestamp;
}

LastAccess.prototype.save = function(callback) {
    var sql = 'insert into last_access (user_id,module) values (?,?)';
    var data = [this.user.id,this.module];
    db.executeQuery(sql,data,function(error,result){
        if (error) {
            return callback(error);
        } else {
            return callback();
        }
    });
};

module.exports = {
    LastAccess: LastAccess
};