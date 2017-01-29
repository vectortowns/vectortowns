const i18n = require("i18n");
const properties = new require('../properties')();
const shared = require('../static/js/shared');
const githubCreateIssue = require( 'github-create-issue' );
const loggerLibrary = require('./logger');
const logger = loggerLibrary.logger;

var createIssue = function(login,text,callback) {

    if ( (!text) || (text.length == 0) || (!shared.validateLogin(login)) ) {
        return callback(i18n.__('app.footer.userMessage.issueError'));
    } else {

        /* Get default options */
        var options = properties.github.options;

        /* Get title and body of issue */
        var title = "Issue created by " + login;
        options.body = text;

        githubCreateIssue( properties.github.url, title, options, function clbk( error, issue, info ) {
            if ( info ) {
                var infoMessage = 'Limit: ' + info.limit +
                    '; Remaining: ' + info.remaining +
                    '; Reset: ' + (new Date( info.reset*1000 )).toISOString();
                logger.info(infoMessage);
            }
            if ( error ) {
                return callback(error);
            } else {
                return callback();
            }
        });

    }

};

module.exports = {
    createIssue: createIssue
};