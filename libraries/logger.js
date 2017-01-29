"use strict";
const properties = new require('../properties')();
const moment = require('moment-timezone')
const winston = require('winston');
const fs = require('fs');
const dateFormat = 'DD-MM-YYYY hh:mm:ss'

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function() { return moment().tz(properties.timezone).format(dateFormat); },
      colorize: true,
      level: 'info'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: properties.log.path + properties.log.file,
      timestamp: function() { return moment().tz(properties.timezone).format(dateFormat); },
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: 'info'
    })
  ]
});

//http://stackoverflow.com/questions/2727167/getting-all-filenames-in-a-directory-with-node-js
var getLogFolder = function(callback) {
    fs.readdir(properties.log.path, function(error, files){
      if (error) {
        callback(error,[]);
      } else {

        // Sort by date
        files.sort(function(a, b) {
          return fs.statSync(properties.log.path + a).mtime.getTime() -
                     fs.statSync(properties.log.path + b).mtime.getTime();
        });

        callback(undefined,files.reverse());
      }
    });
};

// http://stackoverflow.com/questions/7545147/nodejs-synchronization-read-large-file-line-by-line
var getLogFile = function(filename,callback) {
    try {
      const fullFileName = properties.log.path + filename;
      const stats = fs.statSync(fullFileName);
      var bufferSize = stats["size"];
      var fd = fs.openSync(fullFileName, 'r');
      var buffer = new Buffer(bufferSize);
      var json = [];

      var leftOver = '';
      var read, line, idxStart, idx;
      while ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) !== 0) {
          leftOver += buffer.toString('utf8', 0, read);
          idxStart = 0
          while ((idx = leftOver.indexOf("\n", idxStart)) !== -1) {
              line = leftOver.substring(idxStart, idx);
              json.push(JSON.parse(line));
              idxStart = idx + 1;
          }
          leftOver = leftOver.substring(idxStart);

          if ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) == 0) {
              callback(undefined,json);
          }
      }
    } catch (error) {
      callback(error,[]);
    }
};

module.exports = {
    logger: logger,
    getLogFile: getLogFile,
    getLogFolder: getLogFolder
};