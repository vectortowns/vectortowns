const nodemailer = require('nodemailer');
const i18n = require("i18n");
const loggerLibrary = require('./logger');
const logger = loggerLibrary.logger;
const properties = new require('../properties')();

var transporter = nodemailer.createTransport(properties.email.smtpConfig);

/*
    Deprecated - now we use issue tracker of github.
    Note: save code to new feature of "I want to be a moderator" in future...
*/
var sendIssueMessage = function(login,message,url,callback) {

    /* Html body */
    var html ="<!DOCTYPE html><html lang=\"pt_BR\"><head><meta charset=\"UTF-8\"><title>Vectortowns</title></head><body><b>New Issue</b><br />From: ";
    html = html + login;
    html = html + "<br />Message: <i>";
    html = html + message;
    html = html + "</i><br />URL: ";
    html = html + url;
    html = html + "</body></html>";

    var from = "\"" + i18n.__('app.email.recovery.password.name') + "\" " + properties.email.smtpConfig.auth.user;

    /* setup e-mail data */
    var mailOptions = {
        from: from,
        to: properties.email.issueResolver,
        subject: "New Issue of Vectortowns",
        html: html
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            logger.error(error);
            return callback(error);
        } else {
            return callback();
        }
    });

};

var sendRecoveryPasswordMail = function(login,to,link,callback) {

    /* Html body */
    var html ="<!DOCTYPE html><html lang=\"pt_BR\"><head><meta charset=\"UTF-8\"><title>Vectortowns</title></head><body><div style=\"width: 800px; background-color: black; text-align: center;\">";
    html = html + "<img src=\"http://linu.com.br/vectortowns/img/logo_vintage_min.png\" style=\"max-height: 100px; margin-top: 10px; margin-bottom: 10px;\" /></div><div style=\"width: 740px; background-color: #eee; font-style: italic; color: #000; font-size: 18px; font-family: 'Times New Roman', Times, serif; padding: 30px;\">";
    html = html + i18n.__('app.email.recovery.password.text1 %s',login);
    html = html + "<br />";
    html = html + i18n.__('app.email.recovery.password.text2');
    html = html + "<br /><br />";
    html = html + "<a style=\"text-decoration: none;\" href=\"" + link + "\">";
    html = html + i18n.__('app.email.recovery.password.text3');
    html = html + "</a><br /><br />";
    html = html + i18n.__('app.email.recovery.password.text4');
    html = html + "<br /><span style=\"color: #d77;\">";
    html = html + i18n.__('app.email.recovery.password.text5');
    html = html + "</span><br /><br />";
    html = html + i18n.__('app.email.recovery.password.text6');
    html = html + "<br />";
    html = html + i18n.__('app.email.recovery.password.text7');
    html = html + "</div><div style=\"width: 800px; background-color: black; text-align: center; color: #fff; padding-top: 10px; padding-bottom: 10px;\">Vectortowns</div></body></html>";

    var from = "\"" + i18n.__('app.email.recovery.password.name') + "\" " + properties.email.smtpConfig.auth.user;

    /* setup e-mail data */
    var mailOptions = {
        from: from,
        to: to,
        subject: i18n.__('app.email.recovery.password.title'),
        html: html
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            logger.error(error);
            return callback(error);
        } else {
            return callback(undefined,info.response);
        }
    });

};

module.exports = {
    sendRecoveryPasswordMail: sendRecoveryPasswordMail,
    sendIssueMessage: sendIssueMessage
};