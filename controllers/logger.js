const loggerLibrary = require('../libraries/logger');
const logger = loggerLibrary.logger;
const security = require('../libraries/security');
const utils = require('../libraries/utils');
const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    loggerLibrary.getLogFolder(function(error,files){
        if (error) {
            return next(error);
        } else {
            security.render(req, res, next,'private/log/folder', {
                files: files
            });
        }
    });
});

router.get('/:filename', function(req, res, next) {
    security.safeParam(req.params.filename,function(filename,error){
        if (error) return next(error);
        else {
            loggerLibrary.getLogFile(filename,function(error,json){
                if (error) {
                    return next(error);
                } else {
                    security.render(req,res, next,'private/log/file', {
                        lines: json
                    });
                }
            });
        }
    });
});

module.exports = router;