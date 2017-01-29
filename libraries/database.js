const properties = new require('../properties')();
const loggerLibrary = require('./logger');
const logger = loggerLibrary.logger;
const mysql = require('mysql');
const i18n = require("i18n");
const moment = require('moment-timezone');

/* MySQL configure */
var pool  = mysql.createPool(properties.mysql);

var executeQuery = function(sql, data, callback) {
  pool.getConnection(function(connection_error, connection) {
    if (connection_error) {
        logger.error(connection_error);
        return callback(connection_error);
    } else {
        connection.query(sql, data, function(query_error, rows) {
            connection.release();
            if(query_error) {
                logger.error(query_error);
                return callback(query_error);
            } else {
                callback(undefined, rows);
            }
        });
    }
  });
};

var getAll = function(sql,callback) {
    var data = [];
    executeQuery(sql,data,function(error,rows){
        if (error) {
            return callback(error);
        } else {
            return callback(undefined,rows);
        }
    });
};

var callAsyncProcedure = function(query,data) {
    pool.getConnection(function(connection_error, connection) {
        if (connection_error) {
            logger.error(connection_error);
            return;
        } else {
            connection.query(query, data, function(query_error, rows) {
                connection.release();
                if(query_error) {
                    logger.error(query_error);
                    return;
                } else {
                    if (
                        rows == undefined ||
                        rows.length != 2 ||
                        rows[0].length != 1 ||
                        rows[0][0].error == 1
                    ) {
                        logger.error(i18n.__('mysql.procedure.error'));
                    }
                    return;
                }
            });
        }
    });
};

var convertToMoment = function(date) {
    if (date) {
        return moment(new Date(date)).tz(properties.timezone);
    } else {
        return undefined;
    }
};

module.exports = {
    getAll: getAll,
    executeQuery: executeQuery,
    callAsyncProcedure: callAsyncProcedure,
    convertToMoment: convertToMoment
};