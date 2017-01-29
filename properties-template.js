/*

    This file serves as a template for you to create your own.
    Create a new file with the same data. Please do not use this file to make your configuration
    and do not commit changes to it in the repository. Doing so may compromise the security
    of your computer.

    We recommend creating a new directory (outside of this GIT repository) and saving its
    changed properties file. The "properties.js" file located at the root of this project points
    to the actual file that by default is located in "../vectortowns-secret/properties.js". If you
    save it elsewhere, change the "require" of "properties.js".

*/


/* Address and port of environments */
preConfig = {
    development: {
        address: '127.0.0.1', // Local host IP
        port: 8443 // Local host port
    },
    production: {
       address: 'x.x.x.x', // Amazon server IP
        port: 4321 // Amazon server port
    }
};

config = {};

/*************************************************/
/*                         DEVELOPMENT                          */
/*************************************************/

config.development = {
    /* Timezone and i18n configuration data */
    timezone: 'America/Sao_Paulo', // Timezone of amazon server
    locales: ['pt_BR','en_US'], // Locales
    defaultLocale: 'en_US', // Default locale
    /* Server data */
    server: {
        address: preConfig.development.address, // Do not change this
        port: preConfig.development.port // Do not change this
    },
    /* Log folder and file data */
    log: {
        path: '/var/log/nodejs/nodejs-project/', // Location where LOG files will be saved
        file: '-server.log' // LOG file suffix
    },
    /* Passport configuration data with Google */
    googleAuth: {
        clientID: '123andGo.apps.googleusercontent.com', // Client ID of Google - You need to create one if you want to work with this feature
        clientSecret: '123andGo', // Secret of Google - You need to create one if you want to work with this feature
        callbackURL: 'https://' + preConfig.development.address + '/auth/google/callback' // Do not change this
    },
    /* Session data */
    session: {
        name: 'appSessionId', // Do not change this
        secret: '123andGo' // Change to a more secure password
    },
    /* Redis data - Redis is used to save the NodeJS session */
    redis: {
        host: preConfig.development.address, // Do not change this
        port: 6379 // Do not change this
    },
    /* Static files - Static project files are available from Nginx */
    staticServer: {
        host: 'http://' + preConfig.development.address // Do not change this
    },
    /* NodeJS server */
    nodeServer: {
        host: 'https://' + preConfig.development.address // Do not change this
    },
    /* MySQL configuration data */
    mysql: {
        connectionLimit : 10, // Do not change this
        supportBigNumbers: true, // Do not change this
        host: 'x.x.x.x', // MySQL IP
        port: 3306, // MySQL Port
        user: 'vtuser', // MySQL user of application - Change only if necessary
        password : '123andGo', // Change to a more secure password
        database : 'vectortowns' // Do not change this
    },
    /* Materialize configuration data */
    materialize: {
        toastTime: 4000 // Do not change this
    },
    /* Email configuration data */
    email: {
        issueResolver: 'dev@vectortowns.com', // Deprecated - The system saves new issues in the GIT tracker. This email has been kept because it will be needed in the future.
        recoveryLink: 'https://vectortowns.com', // Do not change this
        dateFormat: {
            'pt_BR': 'DD/MM/YYYY hh:mm', // Do not change this
            'en_US': 'MM/DD/YYYY hh:mm', // Do not change this
        },
        /* If you'd like to work with this feature, change the data below (which is illustrative) to an email account of your choice (for example, gmail). */
        smtpConfig: {
            host: 'emailserver.com.br', //  Email administrator IP
            port: 465, // Email administrator PORT
            secure: true, // Do not change this
            name: preConfig.development.address, // Do not change this
            auth: {
                user: 'no-reply@vectortowns.com', // Email account
                pass: '123andGo', // Email secret
            }
        }
    },
    recoveryPassword: {
        delay: 24 // Do not change this
    },
    /*
        Google issue issue tracker settings. If you wanted to work with this, change the data to a repository of your choice.
        Issue tracker of vectortowns:
        https://api.github.com/repos/vectortowns/vectortowns/issues
    */
    github: {
        url: 'vectortowns/vectortowns',
        options: {
            token: '123andGo',
            body: undefined,
            assignees: ["vectortowns"],
            labels: ["bug"]
        }
    }
};

/*************************************************/
/*                          PRODUCTION                            */
/*************************************************/

config.production = {
    /* Timezone and i18n configuration data */
    timezone: 'America/Sao_Paulo', // Timezone of amazon server
    locales: ['pt_BR','en_US'], // Locales
    defaultLocale: 'en_US', // Default locale
    /* Server data */
    server: {
        address: preConfig.development.address, // Do not change this
        port: preConfig.development.port // Do not change this
    },
    /* Log folder and file data */
    log: {
        path: '/var/log/nodejs/nodejs-project/', // Location where LOG files will be saved
        file: '-server.log' // LOG file suffix
    },
    /* Passport configuration data with Google */
    googleAuth: {
        clientID: '123andGo.apps.googleusercontent.com', // Client ID of Google - You need to create one if you want to work with this feature
        clientSecret: '123andGo', // Secret of Google - You need to create one if you want to work with this feature
        callbackURL: 'https://' + preConfig.development.address + '/auth/google/callback' // Do not change this
    },
    /* Session data */
    session: {
        name: 'appSessionId', // Do not change this
        secret: '123andGo' // Change to a more secure password
    },
    /* Redis data - Redis is used to save the NodeJS session */
    redis: {
        host: preConfig.development.address, // Do not change this
        port: 6379 // Do not change this
    },
    /* Static files - Static project files are available from Nginx */
    staticServer: {
        host: 'http://' + preConfig.development.address // Do not change this
    },
    /* NodeJS server */
    nodeServer: {
        host: 'https://' + preConfig.development.address // Do not change this
    },
    /* MySQL configuration data */
    mysql: {
        connectionLimit : 10, // Do not change this
        supportBigNumbers: true, // Do not change this
        host: 'x.x.x.x', // MySQL IP
        port: 3306, // MySQL Port
        user: 'vtuser', // MySQL user of application - Change only if necessary
        password : '123andGo', // Change to a more secure password
        database : 'vectortowns' // Do not change this
    },
    /* Materialize configuration data */
    materialize: {
        toastTime: 4000 // Do not change this
    },
    /* Email configuration data */
    email: {
        issueResolver: 'dev@vectortowns.com', // Deprecated - The system saves new issues in the GIT tracker. This email has been kept because it will be needed in the future.
        recoveryLink: 'https://vectortowns.com', // Do not change this
        dateFormat: {
            'pt_BR': 'DD/MM/YYYY hh:mm', // Do not change this
            'en_US': 'MM/DD/YYYY hh:mm', // Do not change this
        },
        /* If you'd like to work with this feature, change the data below (which is illustrative) to an email account of your choice (for example, gmail). */
        smtpConfig: {
            host: 'emailserver.com.br', //  Email administrator IP
            port: 465, // Email administrator PORT
            secure: true, // Do not change this
            name: preConfig.development.address, // Do not change this
            auth: {
                user: 'no-reply@vectortowns.com', // Email account
                pass: '123andGo', // Email secret
            }
        }
    },
    recoveryPassword: {
        delay: 24 // Do not change this
    },
    /*
        Google issue issue tracker settings. If you wanted to work with this, change the data to a repository of your choice.
        Issue tracker of vectortowns:
        https://api.github.com/repos/vectortowns/vectortowns/issues
    */
    github: {
        url: 'vectortowns/vectortowns',
        options: {
            token: '123andGo',
            body: undefined,
            assignees: ["vectortowns"],
            labels: ["bug"]
        }
    }
};

var env = process.env.NODE_ENV;
if (env === undefined) env = 'development';
if (env === 'test') env = 'development';

module.exports = function(){
    return config[env];
};