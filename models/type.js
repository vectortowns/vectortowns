const i18n = require("i18n");
const db = require('../libraries/database');

var Type = function(id,description) {
    this.id = id;
    this.description = description;
}

Type.prototype.getAll = function(callback) {
    var sql = 'select * from type';
    db.getAll(sql,function(error,rows){
        return callback(error,rows);
    });
};

module.exports = {
    Type: Type
};