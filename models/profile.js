"use strict";
const db = require('../libraries/database');

var Profile = function(id,description) {
    this.id = id;
    this.description = description;
}

Profile.prototype.getAll = function(callback) {
    var sql = 'select * from profile';
    db.getAll(sql,function(error,rows){
        return callback(error,rows);
    });
};

module.exports = {
    Profile: Profile
};