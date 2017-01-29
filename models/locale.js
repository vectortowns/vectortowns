const i18n = require("i18n");
const db = require('../libraries/database');

var Locale = function(id,description,abbreviation) {
    this.id = id;
    this.description = description;
    this.abbreviation = abbreviation;
}

Locale.prototype.getAll = function(callback) {
    var sql = 'select * from locale';
    db.getAll(sql,function(error,rows){
        return callback(error,rows);
    });
};

module.exports = {
    Locale: Locale
};